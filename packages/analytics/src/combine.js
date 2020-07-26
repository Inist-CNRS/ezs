import get from 'lodash.get';
import set from 'lodash.set';
import debug from 'debug';
import { createStore } from './store';

async function saveIn(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const store = this.getEnv();
    const key = get(data, 'id');
    const isKey = Boolean(key);
    if (isKey) {
        await store.put(key, data);
    }
    return feed.send(key);
}

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
 * @param {String} [cache] Use a specific ezs statement to run commands (advanced)
 * @returns {Object}
 */
export default function combine(data, feed) {
    const { ezs } = this;
    let whenReady = Promise.resolve(true);
    if (this.isFirst()) {
        debug('ezs')('[combine] with sub pipeline.');
        const location = this.getParam('location');
        this.store = createStore(ezs, 'combine', location);
        this.store.reset();
        const primer = this.getParam('primer', this.store.id());
        const input = ezs.createStream(ezs.objectMode());
        const commands = ezs.createCommands({
            file: this.getParam('file'),
            script: this.getParam('script'),
            command: this.getParam('command'),
            commands: this.getParam('commands'),
            prepend: this.getParam('prepend'),
            append: this.getParam('append'),
        });
        const cache = this.getParam('cache');
        let statements;
        if (cache) {
            statements = [ezs(cache, { commands }, this.getEnv())];
        } else {
            statements = ezs.compileCommands(commands, this.getEnv());
        }
        const output = ezs.createPipeline(input, statements)
            .pipe(ezs(saveIn, null, this.store))
            .pipe(ezs.catch())
            .on('data', (d) => d)
            .on('error', (e) => feed.stop(e));
        whenReady = new Promise((resolve) => output.on('end', () => resolve));
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
            } else {
                set(data, path, { id: key });
            }
            return feed.send(data);
        })
        .catch((e) => feed.stop(e));
}
