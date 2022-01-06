import get from 'lodash.get';
import set from 'lodash.set';
import debug from 'debug';
import assert from 'assert';
import crypto from 'crypto';
import { createStore, createPersistentStore } from '@ezs/store';

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

function sha1(input, salt) {
    return crypto.createHash('sha1').update(JSON.stringify(input) + String(salt)).digest('hex');
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
 * @param {String} [default] value if no substitution (otherwise value stay unchanged)
 * @param {String} [primer=auto] Data to send to the external pipeline
 * @param {String} [file] the external pipeline is described in a file
 * @param {String} [script] the external pipeline is described in a string of characters
 * @param {String} [commands] the external pipeline is described in a object
 * @param {String} [command] the external pipeline is described in a URL-like command
 * @param {String} [persistent=false] The internal database will be reused until it is deleted
 * @param {String} [cache] Use a specific ezs statement to run commands (advanced)
 * @returns {Object}
 */
export default function combine(data, feed) {
    const { ezs } = this;
    const persistent = Boolean(this.getParam('persistent', false));
    let whenReady = Promise.resolve(true);
    if (this.isFirst()) {
        debug('ezs')('[combine] with sub pipeline.');
        const location = this.getParam('location');
        const primer = this.getParam('primer');
        const input = ezs.createStream(ezs.objectMode());
        const commands = ezs.createCommands({
            file: this.getParam('file'),
            script: this.getParam('script'),
            command: this.getParam('command'),
            commands: this.getParam('commands'),
            prepend: this.getParam('prepend'),
            append: this.getParam('append'),
        });
        if (persistent) {
            this.store = createPersistentStore(ezs, sha1(commands, primer), location);
        } else {
            this.store = createStore(ezs, 'combine', location);
        }
        if (persistent && !this.store.isCreated()) {
            whenReady = Promise.resolve(true);
        } else {
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
                .on('data', (d) => assert(d)) // WARNING: The data must be consumed, otherwise the "end" event has not been triggered
                .on('error', (e) => feed.stop(e));
            whenReady = new Promise((resolve) => output.on('end', resolve));
            input.write(primer || this.store.id());
            input.end();
        }
    }
    if (this.isLast()) {
        if (!persistent) {
            this.store.close();
        }
        return feed.close();
    }
    return whenReady
        .then(async () => {
            const defval = this.getParam('default', null);
            const path = this.getParam('path');
            const pathVal = get(data, path);
            const keys = [].concat(pathVal).filter(Boolean);
            if (keys.length === 0) {
                return feed.send(data);
            }
            const values = await Promise.all(keys.map((key) => this.store.get(key)));
            if (values.length && Array.isArray(pathVal)) {
                set(data, path, values);
            } else if (values.length && !Array.isArray(pathVal)) {
                const val = values.shift();
                if (val !== null) {
                    set(data, path, val);
                } else if (defval !== null) {
                    const orig = get(data, path);
                    set(data, path, { id: orig, value: defval });
                } else {
                    const orig = get(data, path);
                    set(data, path, { id: orig, value: orig });
                }
            } else if (Array.isArray(pathVal)) {
                set(data, path, pathVal.map((id) => ({ id })));
            } else {
                set(data, path, { id: pathVal });
            }
            return feed.send(data);
        })
        .catch((e) => {
            if (this.store) {
                this.store.close();
            }
            feed.stop(e);
        });
}
