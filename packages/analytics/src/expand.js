import { resolve  as resolvePath } from 'path';
import from from 'from';
import { tmpdir } from 'os';
import get from 'lodash.get';
import set from 'lodash.set';
import cacache from 'cacache';
import makeDir from 'make-dir';
import pathExists from 'path-exists';
import core from './core';

async function cacheGet(cachePath, cacheKey) {
    const cacheObject = await cacache.get.info(cachePath, cacheKey);
    if (!cacheObject) {
        return null;
    }
    const cacheData = await cacache.get.byDigest(cachePath, cacheObject.integrity);
    return JSON.parse(cacheData.toString());
}

async function cachePut(cachePath, cacheKey, cacheValue) {
    if (cacheValue) {
        const integity = await cacache.put(cachePath, cacheKey, JSON.stringify(cacheValue));
        return integity;
    }
    return false;
}

async function mergeWith(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const {
        store,
        cachePath,
    } = this.getEnv();
    const { id, value } = data;
    const path = this.getParam('path');
    try {
        const obj = store[id];

        delete store[id];
        if (obj === undefined || obj === null) {
            throw new Error('id was corrupted');
        }
        const source = get(obj, path);
        if (cachePath && source) {
            await cachePut(cachePath, source, value);
        }
        set(obj, path, value);
        return feed.send(obj);
    } catch (e) {
        // avoid to break the pipe
        return feed.send(e);
    }
}

async function drainWith(data, feed) {
    if (this.isLast()) {
        const {
            store,
        } = this.getEnv();
        Object.keys(store).forEach((id) => {
            const obj = store[id];
            feed.write(obj);
            delete store[id];
        });
        return feed.close();
    }
    return feed.send(data);
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
    const { ezs } = this;
    const size = Number(this.getParam('size', 1));
    const path = this.getParam('path');
    const cacheName = this.getParam('cacheName');

    if (this.isFirst()) {
        this.store = {};
        this.buffer = [];
        if (cacheName && !this.cachePath) {
            const location = this.getParam('location');
            this.cachePath = resolvePath(location || tmpdir(), 'memory', `expand${cacheName}`);
            if (!pathExists.sync(this.cachePath)) {
                makeDir.sync(this.cachePath);
            }
        }
    }
    if (this.isLast()) {
        if (this.buffer && this.buffer.length > 0) {
            const check = this.buffer.length;
            let count = 0;
            const input = from(this.buffer);
            const commands = ezs.createCommands({
                file: this.getParam('file'),
                script: this.getParam('script'),
                command: this.getParam('command'),
                commands: this.getParam('commands'),
                prepend: this.getParam('prepend'),
                append: this.getParam('append'),
            });
            const statements = ezs.compileCommands(commands, this.getEnv());
            const output = ezs.createPipeline(input, statements)
                .pipe(ezs(mergeWith, { path }, {
                    store: this.store,
                    cachePath: this.cachePath,
                }))
                .pipe(ezs(drainWith, { path }, {
                    store: this.store,
                    cachePath: this.cachePath,
                }))
                .pipe(ezs.catch((e) => feed.write(e))) // avoid to break pipeline at each error
                .on('data', () => {
                    count += 1;
                })
                .on('end', () => {
                    if (count < check) {
                        Object.keys(this.store).forEach((x) => {
                            const obj = this.store[x];
                            feed.write(obj);
                            delete this.store[x];
                        });
                    }
                });
            await feed.flow(output);
            this.buffer = [];
        }
        return feed.close();
    }

    // no path
    const value = get(data, path);
    if (!value || value.length === 0) {
        return feed.send(data);
    }

    // value in cache
    if (this.cachePath) {
        const cachedValue = await cacheGet(this.cachePath, value);
        if (cachedValue) {
            set(data, path, cachedValue);
            return feed.send(data);
        }
    }

    // normal case
    const id = this.getIndex().toString().padStart(20, '0');
    this.store[id] = data;
    this.buffer.push(core(id, value));

    // new bucket
    if (this.buffer.length >= size) {
        const check = this.buffer.length;
        let count = 0;
        const input = from(this.buffer);
        const commands = ezs.createCommands({
            file: this.getParam('file'),
            script: this.getParam('script'),
            command: this.getParam('command'),
            commands: this.getParam('commands'),
            prepend: this.getParam('prepend'),
            append: this.getParam('append'),
        });
        const statements = ezs.compileCommands(commands, this.getEnv());
        const output = ezs.createPipeline(input, statements)
            .pipe(ezs(mergeWith, { path }, {
                store: this.store,
                cachePath: this.cachePath,
            }))
            .pipe(ezs.catch((e) => feed.write(e)))  // avoid to break pipeline at each error
            .on('data', () => {
                count += 1;
            })
            .on('end', () => {
                if (count < check) {
                    Object.keys(this.store).forEach((x) => {
                        const obj = this.store[x];
                        feed.write(obj);
                        delete this.store[x];
                    });
                }
            });
        await feed.flow(output);
        this.buffer = [];
        return true;
    }
    return feed.end();
}
/*
{
    try {
        const { ezs } = this;
        const path = this.getParam('path');
        const cacheName = this.getParam('cacheName');

        if (!this.store) {
            this.store = {}
            this.flows = [];
        }
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
        if (cacheName && !this.cachePath) {
            const location = this.getParam('location');
            this.cachePath = resolvePath(location || tmpdir(), 'memory', `expand${cacheName}`);
            if (!pathExists.sync(this.cachePath)) {
                makeDir.sync(this.cachePath);
            }
        }

        if (!this.buffer2stream) {
            this.buffer2stream = () => {
                const statements = this.createStatements();
                const stream = ezs.createStream(ezs.objectMode());
                const output = ezs.createPipeline(stream, statements)
                    .pipe(ezs(mergeWith, { path }, {
                        store: this.store,
                        cachePath: this.cachePath,
                    }))
                    .pipe(ezs(drainWith, { path }, {
                        store: this.store,
                        cachePath: this.cachePath,
                    }))
                ;
                const input = Array.from(this.buffer);
                this.buffer = [];

                each(input, (cur, next) => ezs.writeTo(stream, cur, next), () => stream.end());
                return output;
            };
        }
        if (!this.buffer) {
            this.buffer = [];
        }

        // Processing

        if (this.isLast()) {
            if (this.buffer && this.buffer.length > 0) {
                const strm = this.buffer2stream();
                this.flows.push(feed.flow(strm));
            }
            await Promise.all(this.flows);
            delete this.store;
            return feed.close();
        }
        const value = get(data, path);
        if (!value || value.length === 0) {
            return feed.send(data);
        }
        if (this.cachePath) {
            const cachedValue = await cacheGet(this.cachePath, value);
            if (cachedValue) {
                set(data, path, cachedValue);
                return feed.send(data);
            }
        }
        const id = this.getIndex().toString().padStart(20, '0');
        const size = Number(this.getParam('size', 1));

        this.store[id] = data;

        this.buffer.push(core(id, value));
        if (this.buffer.length >= size) {
            const strm = this.buffer2stream();
            return this.flows.push(feed.flow(strm));
        }
        return feed.end();
    } catch (e) {
        if (this.store) {
            delete this.store;
        }
        return feed.stop(e);
    }
}
*/
