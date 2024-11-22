import _ from 'lodash';
import debug from 'debug';
import assert from 'assert';
import hasher from 'node-object-hash';
import { resolve  as resolvePath } from 'path';
import { tmpdir } from 'os';
import makeDir from 'make-dir';
import pathExists from 'path-exists';
import cacache from 'cacache';

const hashCoerce = hasher({ sort: false, coerce: true });
const core = (id, value) => ({ id, value });

async function saveIn(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const database = this.getEnv();
    const { id, value } = data;
    const isKey = Boolean(id);
    if (isKey) {
        if (!database[id]) {
            database[id] = value;
        }
    }
    return feed.send(data);
}

function cacheSave(data, feed) {
    const { ezs } = this;
    const cachePath = this.getParam('cachePath');
    const cacheKey = this.getParam('cacheKey');
    if (this.isLast()) {
        if (cachePath && cacheKey) {
            this.whenFinish.finally(() => feed.close());
            return this.input.end();
        }
        return feed.close();
    }
    if (cachePath && cacheKey) {
        if (!this.input) {
            this.input = ezs.createStream(ezs.objectMode());
            this.whenFinish = new Promise(
                (resolve) => this.input
                    .pipe(ezs('pack'))
                    .pipe(cacache.put.stream(cachePath, cacheKey))
                    .on('end', resolve)
            );
        }
        return ezs.writeTo(this.input, data, () => feed.send(data));
    }
    return feed.send(data);
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
 * @param {String} [primer=n/a] Data to send to the external pipeline
 * @param {String} [file] the external pipeline is described in a file
 * @param {String} [script] the external pipeline is described in a string of characters
 * @param {String} [commands] the external pipeline is described in a object
 * @param {String} [command] the external pipeline is described in a URL-like command
 * @param {String} [logger] A dedicaded pipeline described in a file to trap or log errors
 * @param {String} [cacheName] Enable cache, with dedicated name
 * @returns {Object}
 */
export default async function combine(data, feed) {
    const { ezs } = this;
    const cacheName = this.getParam('cacheName');
    let whenReady = Promise.resolve(true);
    if (this.isFirst()) {
        if (cacheName && !this.cachePath) {
            const location = this.getParam('location');
            this.cachePath = resolvePath(location || tmpdir(), 'memory', `combine/${cacheName}`);
            if (!pathExists.sync(this.cachePath)) {
                makeDir.sync(this.cachePath);
            }
        }
        const primer = this.getParam('primer', 'n/a');
        const commands = ezs.createCommands({
            file: this.getParam('file'),
            script: this.getParam('script'),
            command: this.getParam('command'),
            commands: this.getParam('commands'),
            prepend: this.getParam('prepend'),
            append: this.getParam('append'),
        });
        this.databaseID = hashCoerce.hash({ primer, commands });
        debug('ezs:debug')(`[combine] with sub pipeline #${this.databaseID}`);
        const input = ezs.createStream(ezs.objectMode());
        this.database = {};
        let stream;
        if (cacheName) {
            const cacheObject = await cacache.get.info(this.cachePath, this.databaseID);
            if (cacheObject) {
                stream = cacache.get.stream.byDigest(this.cachePath, cacheObject.integrity).pipe(ezs('unpack'));
            }
        }
        if (!stream) {
            const statements = ezs.compileCommands(commands, this.getEnv());
            const logger = ezs.createTrap(this.getParam('logger'), this.getEnv());
            stream = ezs.createPipeline(input, statements, logger)
                .pipe(ezs(cacheSave, {
                    cachePath: this.cachePath,
                    cacheKey: this.databaseID,
                }));
        }
        const output = stream
            .pipe(ezs(saveIn, null, this.database))
            .pipe(ezs.catch())
            .on('data', (d) => assert(d)) // WARNING: The data must be consumed, otherwise the "end" event has not been triggered
            .on('error', (e) => feed.stop(e));
        whenReady = new Promise((resolve) => output.on('end', resolve));
        input.write(primer);
        input.end();
    }
    if (this.isLast()) {
        return feed.close();
    }
    await whenReady;
    const defval = this.getParam('default', null);
    const path = this.getParam('path');
    const pathVal = _.get(data, path);
    const keys = [].concat(pathVal).filter(Boolean);
    if (keys.length === 0) {
        return feed.send(data);
    }
    const values = keys.map((key) => {
        if (!this.database[key]) {
            return null;
        }
        return core(key, this.database[key]);
    });
    // length of the values is always equal to the length of the keys.
    if (Array.isArray(pathVal)) {
        _.set(data, path, values);
    } else  {
        const val = values.shift();
        if (val !== null) {
            _.set(data, path, val);
        } else if (defval !== null) {
            const orig = _.get(data, path);
            _.set(data, path, { id: orig, value: defval });
        } else {
            const orig = _.get(data, path);
            _.set(data, path, { id: orig, value: orig });
        }
    }
    return feed.send(data);

}
