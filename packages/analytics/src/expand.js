import get from 'lodash.get';
import set from 'lodash.set';
import { createPersistentStore, createStore } from '@ezs/store';
import each from 'async-each-series';
import core from './core';

async function mergeWith(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const {
        store,
        cache,
        stack,
        bufferID,
    } = this.getEnv();
    const { id, value } = data;
    const path = this.getParam('path');
    try {
        const obj = await store.get(id);
        if (obj === null) {
            throw new Error('id was corrupted');
        }
        const source = get(obj, path);
        if (cache && source) {
            await cache.put(source, value);
        }
        delete stack[bufferID][id];
        set(obj, path, value);
        return feed.send(obj);
    } catch (e) {
        return feed.send(e);
    }
}

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
 * @param {Number} [size=1] How many chunk for sending to the external pipeline
 * @param {String} [file] the external pipeline is described in a file
 * @param {String} [script] the external pipeline is described in a string of characters
 * @param {String} [commands] the external pipeline is described in a object
 * @param {String} [command] the external pipeline is described in a URL-like command
 * @param {String} [cacheName] Enable cache, with dedicated name
 * @returns {Object}
 */
export default async function expand(data, feed) {
    try {
        const { ezs } = this;
        const path = this.getParam('path');
        const cacheName = this.getParam('cacheName');

        // Initialization
        if (!this.createStatements) {
            const commands = ezs.createCommands({
                file: this.getParam('file'),
                script: this.getParam('script'),
                command: this.getParam('command'),
                commands: this.getParam('commands'),
                prepend: this.getParam('prepend'),
                append: this.getParam('append'),
            });
            this.createStatements = () => ezs.compileCommands(commands, this.getEnv());
        }
        if (cacheName && !this.cache) {
            const location = this.getParam('location');
            this.cache = createPersistentStore(ezs, `expand${cacheName}`, location);
        }
        if (!this.buffer2stream) {
            this.buffer2stream = (bufferID) => {
                const statements = this.createStatements();
                const stream = ezs.createStream(ezs.objectMode());
                const output = ezs.createPipeline(stream, statements)
                    .pipe(ezs(mergeWith, { path }, {
                        store: this.store,
                        cache: this.cache,
                        stack: this.stack,
                        bufferID,
                    }))
                    .pipe(ezs.catch())
                    .on('end', () => each(
                        Object.keys(this.stack[bufferID]),
                        async (cur, next) => {
                            try {
                                const obj = await this.store.get(cur);
                                if (obj === null) {
                                    throw new Error('id has been lost');
                                }
                                feed.write(obj);
                            } catch (e) {
                                feed.write(e);
                            }
                            next();
                        },
                    ));
                const input = Array.from(this.buffer);
                this.buffer = [];
                this.bufferID += 1;
                this.stack[this.bufferID] = {};

                each(input, (cur, next) => ezs.writeTo(stream, cur, next), () => stream.end());
                return output;
            };
        }
        if (!this.buffer) {
            this.stack = [];
            this.buffer = [];
            this.bufferID = 0;
            this.stack[this.bufferID] = {};
        }
        if (!this.store) {
            const location = this.getParam('location');
            this.store = createStore(ezs, 'expand', location);
            this.store.reset();
        }

        // Processing

        if (this.isLast()) {
            if (this.buffer && this.buffer.length > 0) {
                return feed.flow(this.buffer2stream(this.bufferID));
            }
            return feed.close();
        }
        const value = get(data, path);
        if (!value || value.length === 0) {
            return feed.send(data);
        }
        if (this.cache) {
            const cachedValue = await this.cache.get(value);
            if (cachedValue !== null) {
                set(data, path, cachedValue);
                return feed.send(data);
            }
        }
        const id = this.getIndex().toString().padStart(20, '0');
        const size = Number(this.getParam('size', 1));

        await this.store.put(id, data);

        this.stack[this.bufferID][id] = true;
        this.buffer.push(core(id, value));
        if (this.buffer.length >= size) {
            return feed.flow(this.buffer2stream(this.bufferID));
        }
        return feed.end();
    } catch (e) {
        return feed.stop(e);
    }
}
