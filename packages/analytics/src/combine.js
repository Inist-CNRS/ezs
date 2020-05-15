import get from 'lodash.get';
import set from 'lodash.set';
import debug from 'debug';
import Store from './store';

/**
 * Takes an `Object` and substitute a field with the corresponding value found in a external pipeline
 * the internal pipeline must produce a stream of special object (id, value)
 *
 * ```json
 * [
 *           { year: 2000, dept: 54 },
 *           { year: 2001, dept: 55 },
 *           { year: 2003, dept: 54 },
 * ]
 * ```
 *
 * Script:
 *
 * ```ini
 * [use]
 * plugin = analytics
 *
 * [combine]
 * path = dept
 * file = ./departement.ini
 *
 * ```
 *
 * Output:
 *
 * ```json
 *  [
 *           { year: 2000, dept: { id: 54, value: 'Meurthe et moselle' } },
 *           { year: 2001, dept: { id: 55, value: 'Meuse' } },
 *           { year: 2003, dept: { id: 54, value: 'Meurthe et moselle' } },
 *  ]
 * ```
 *
 * @name combine
 * @param {String} [path] the path to substitute
 * @param {String} [primer=auto] Data to send to the external pipeline
 * @param {String} [file] the external pipeline is described in a file
 * @param {String} [script] the external pipeline is described in a string of characters
 * @param {String} [commands] the external pipeline is described in a object
 * @param {String} [command] the external pipeline is described in a URL-like command
 * @returns {Object}
 */
export default function combine(data, feed) {
    const { ezs } = this;
    let whenReady = Promise.resolve(true);
    if (this.isFirst()) {
        const file = this.getParam('file');
        const fileContent = ezs.loadScript(file);
        const script = this.getParam('script', fileContent);
        const cmd1 = ezs.compileScript(script).get();
        const command = this.getParam('command');
        const cmd2 = [].concat(command).map(ezs.parseCommand).filter(Boolean);
        const commands = this.getParam('commands', cmd1.concat(cmd2));
        const environment = this.getEnv();
        if (!commands || commands.length === 0) {
            return feed.stop(new Error('Invalid parmeter for [combine]'));
        }
        debug('ezs')('[combine] with sub pipeline.');
        const domain = `combine_${Math.random()}`;
        const primer = this.getParam('primer', domain);
        const location = this.getParam('location');
        this.store = new Store(ezs, domain, location);
        this.store.reset();
        const streams = ezs.compileCommands(commands, environment);
        const input = ezs.createStream(ezs.objectMode());
        const output = ezs.createPipeline(input, streams)
            .pipe(ezs.catch())
            .on('data', async (item) => {
                const key = get(item, 'id');
                const isKey = Boolean(key);

                if (isKey) {
                    await this.store.put(key, item);
                }
            })
            .on('error', (e) => feed.stop(e));
        whenReady = new Promise((resolve) => output.on('end', resolve));
        input.write(primer);
        input.end();
    }
    if (this.isLast()) {
        this.store.close();
        return feed.close();
    }
    return whenReady
        .then(async () => {
            const path = this.getParam('path');
            const key = get(data, path);
            const validKey = Boolean(key);
            if (!validKey) {
                return feed.send(data);
            }
            const value = await this.store.get(key);
            if (value) {
                set(data, path, value);
            }
            return feed.send(data);
        })
        .catch((e) => feed.stop(e));
}
