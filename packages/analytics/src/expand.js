import get from 'lodash.get';
import set from 'lodash.set';
import debug from 'debug';
import { createStore } from '@ezs/store';
import core from './core';

async function mergeWith(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const store = this.getEnv();
    const { id, value } = data;
    const path = this.getParam('path');
    try {
        const obj = await store.get(id);
        if (obj === null) {
            throw new Error('id was corrupted');
        }
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
 * @param {String} [file] the external pipeline is described in a file
 * @param {String} [script] the external pipeline is described in a string of characters
 * @param {String} [commands] the external pipeline is described in a object
 * @param {String} [command] the external pipeline is described in a URL-like command
 * @param {String} [cache] Use a specific ezs statement to run commands (advanced)
 * @returns {Object}
 */
export default async function expand(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }

    const path = this.getParam('path');
    const id = this.getIndex().toString().padStart(20, '0');
    const value = get(data, path);
    const { ezs } = this;

    if (value === undefined) {
        return feed.send(data);
    }

    if (!this.store) {
        const location = this.getParam('location');
        this.store = createStore(ezs, 'expand', location);
        this.store.reset();
    }

    try {
        await this.store.put(id, data);
    } catch (e) {
        return feed.stop(e);
    }

    let statements;
    const commands = ezs.createCommands({
        file: this.getParam('file'),
        script: this.getParam('script'),
        command: this.getParam('command'),
        commands: this.getParam('commands'),
        prepend: this.getParam('prepend'),
        append: this.getParam('append'),
    });

    const cache = this.getParam('cache');
    if (cache) {
        statements = [ezs(cache, { commands }, this.getEnv())];
    } else {
        statements = ezs.compileCommands(commands, this.getEnv());
    }
    const stream = ezs.createStream(ezs.objectMode());
    const output = ezs.createPipeline(stream, statements)
        .pipe(ezs(mergeWith, { path }, this.store))
        .pipe(ezs.catch());
    ezs.writeTo(stream, core(id, value), () => stream.end());
    return feed.flow(output);
}
