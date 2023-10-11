import { resolve  as resolvePath } from 'path';
import from from 'from';
import { tmpdir } from 'os';
import _ from 'lodash';
import cacache from 'cacache';
import makeDir from 'make-dir';
import pathExists from 'path-exists';

const core = (id, value, token) => {
    if (token) {
        return { id, value, token };
    }
    return { id, value };
};

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
        const source = _.get(obj, path);
        if (cachePath && source) {
            await cachePut(cachePath, source, value);
        }
        _.set(obj, path, value);
        return feed.send(obj);
    } catch (e) {
        // avoid to break the pipe
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
 * @param {String} [logger] A dedicaded pipeline described in a file to trap or log errors
 * @param {String} [cacheName] Enable cache, with dedicated name
 * @param {String} [token] add token values in the subpipeline (optional)
 * @returns {Object}
 */
export default async function expand(data, feed) {
    const { ezs } = this;
    const size = Number(this.getParam('size', 1));
    const path = this.getParam('path');
    const cacheName = this.getParam('cacheName');

    if (this.isFirst()) {
        this.store = {};
        this.buffer = [[]];
        this.bufferIndex = 0;
        this.bufferPromises = [[]];
        if (cacheName && !this.cachePath) {
            const location = this.getParam('location');
            this.cachePath = resolvePath(location || tmpdir(), 'memory', `expand${cacheName}`);
            if (!pathExists.sync(this.cachePath)) {
                makeDir.sync(this.cachePath);
            }
        }
    }
    if (this.isLast()) {
        if (this.buffer[this.bufferIndex] && this.buffer[this.bufferIndex].length > 0) {
            const input = from(this.buffer[this.bufferIndex]);
            const commands = ezs.createCommands({
                file: this.getParam('file'),
                script: this.getParam('script'),
                command: this.getParam('command'),
                commands: this.getParam('commands'),
                prepend: this.getParam('prepend'),
                append: this.getParam('append'),
            });
            const statements = ezs.compileCommands(commands, this.getEnv());
            const logger = ezs.createTrap(this.getParam('logger'), this.getEnv());
            const output = ezs.createPipeline(input, statements, logger)
                .pipe(ezs(mergeWith, { path }, {
                    store: this.store,
                    cachePath: this.cachePath,
                }))
                .pipe(ezs.catch((e) => feed.write(e))) // avoid to break pipeline at each error
                .once('end', () => {
                    delete this.buffer[this.bufferIndex];
                });
            this.bufferPromises[this.bufferIndex] = await feed.flow(output);
        }
        await Promise.all(this.bufferPromises);
        Object.keys(this.store).forEach(key => feed.write(this.store[key]));
        return feed.close();
    }

    // no path
    const value = _.get(data, path);
    if (!value || value.length === 0) {
        return feed.send(data);
    }

    // value in cache
    if (this.cachePath) {
        const cachedValue = await cacheGet(this.cachePath, value);
        if (cachedValue) {
            _.set(data, path, cachedValue);
            return feed.send(data);
        }
    }

    // normal case
    const id = this.getIndex().toString().padStart(20, '0');
    this.store[id] = data;
    this.buffer[this.bufferIndex].push(core(id, value, this.getParam('token')));

    // new bucket
    if (this.buffer[this.bufferIndex].length >= size) {
        const index = this.bufferIndex;
        this.bufferIndex += 1;
        this.buffer[this.bufferIndex] = [];
        const input = from(this.buffer[index]);
        const commands = ezs.createCommands({
            file: this.getParam('file'),
            script: this.getParam('script'),
            command: this.getParam('command'),
            commands: this.getParam('commands'),
            prepend: this.getParam('prepend'),
            append: this.getParam('append'),
        });
        const statements = ezs.compileCommands(commands, this.getEnv());
        const logger = ezs.createTrap(this.getParam('logger'), this.getEnv());
        const output = ezs.createPipeline(input, statements, logger)
            .pipe(ezs(mergeWith, { path }, {
                store: this.store,
                cachePath: this.cachePath,
            }))
            .pipe(ezs.catch((e) => feed.write(e)))  // avoid to break pipeline at each error
            .once('end', () => {
                delete this.buffer[index];
            });
        this.bufferPromises[index] = await feed.flow(output);
        return true;
    }
    return feed.end();
}
