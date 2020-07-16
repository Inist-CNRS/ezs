import get from 'lodash.get';
import set from 'lodash.set';
import debug from 'debug';
import core from './core';
import { createStore } from './store';

/**
 * Takes an `Object` and substitute a field with the corresponding value found in a external pipeline
 * the internal pipeline receive a special object { id, value } id is the item identifier & value is the item path value
 * The internal pipeline can expand value with another
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
 * [expand]
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
 * @name expand
 * @param {String} [path] the path to substitute
 * @param {String} [file] the external pipeline is described in a file
 * @param {String} [script] the external pipeline is described in a string of characters
 * @param {String} [commands] the external pipeline is described in a object
 * @param {String} [command] the external pipeline is described in a URL-like command
 * @returns {Object}
 */
export default async function expand(data, feed) {
    const { ezs } = this;
    const path = this.getParam('path');
    let whenFinish = Promise.resolve(true);
    if (this.isFirst()) {
        debug('ezs')('[expand] with sub pipeline.');
        const location = this.getParam('location');
        this.store = createStore(ezs, 'expand', location);
        this.store.reset();
        const commands = ezs.createCommands({
            file: this.getParam('file'),
            script: this.getParam('script'),
            command: this.getParam('command'),
            commands: this.getParam('commands'),
            prepend: this.getParam('prepend'),
            append: this.getParam('append'),
        });
        const statements = ezs.compileCommands(commands, this.getEnv());
        this.input = ezs.createStream(ezs.objectMode());
        const output = ezs.createPipeline(this.input, statements)
            .pipe(ezs.catch())
            .on('data', async ({ id, value }) => {
                try {
                    const obj = await this.store.get(id);
                    if (obj === null) {
                        feed.stop(new Error('id was corrupted'));
                    }
                    set(obj, path, value);
                    feed.write(obj);
                } catch (e) {
                    feed.stop(e);
                }
            })
            .on('error', (e) => feed.stop(e));
        whenFinish = new Promise((resolve) => output.on('end', resolve));
    }
    if (this.isLast()) {
        return whenFinish
            .then(() => {
                this.store.close();
                return feed.close();
            })
            .catch((e) => feed.stop(e));
    }
    const value = get(data, path);
    const validValue = Boolean(value);
    if (!validValue) {
        return feed.send(data);
    }
    const id = this.getIndex().toString().padStart(20, '0');
    await this.store.put(id, data);
    return this.input.write(core(id, value), () => feed.end());
}
