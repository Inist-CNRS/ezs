import { resolve  as resolvePath } from 'path';
import generate from 'nanoid/async/generate';
import nolookalikes from 'nanoid-dictionary/nolookalikes';
import from from 'from';
import { tmpdir } from 'os';
import _ from 'lodash';
import cacache from 'cacache';
import makeDir from 'make-dir';
import pathExists from 'path-exists';

/**
 * Takes an `Object` and substitute twice a field with the corresponding value found in a external pipeline
 * the internal pipeline receive a special object { id, value, token } :
 *   - id is the item identifier
 *   - value is the item path value,
 *   - token is an array containing stream id and an number (0 for first time, 1 for the second tme
 * The internal pipeline can overturn value with another.
 *
 *
 * It's work like [expand] but
 * the second call starts only when all the values of the stream have been sent once
 *
 * ```json
 * [
 *           { year: 2000, dept: 'Meuse' },
 *           { year: 2001, dept: 'Moselle' },
 *           { year: 2003, dept: 'Vosges'},
 * ]
 * ```
 *
 * Script #1:
 *
 * ```ini
 * [overturn]
 * path = dept
 *
 * [overturn/assign]
 * path = value
 * value = get('value').split('').reverse().join('')
 *
 * ```
 *
 * Output:
 *
 * ```json
 *  [
 *           { year: 2000, dept: 'Meuse' },
 *           { year: 2001, dept: 'Moselle' },
 *           { year: 2003, dept: 'Vosges' },
 *  ]
 * ```
 *
 * Script #2:
 *
 * ```ini
 * [overturn]
 * path = dept
 *
 * [overturn/drop]
 *   path = token.1
 *   if = 0
 *
 * [overturn/assign]
 * path = value
 * value = get('value').split('').reverse().join('')
 *
 * ```
 *
 * Output:
 *
 * ```json
 *  [
 *           { year: 2000, dept: 'esueM' },
 *           { year: 2001, dept: 'ellesoM' },
 *           { year: 2003, dept: 'segsoV' },
 *  ]
 * ```
 *
 * @name overturn
 * @param {String} [path] the path to overturn
 * @param {Number} [size=1] How many chunk for sending to the external pipeline
 * @param {String} [file] the external pipeline is described in a file
 * @param {String} [script] the external pipeline is described in a string of characters
 * @param {String} [commands] the external pipeline is described in a object
 * @param {String} [command] the external pipeline is described in a URL-like command
 * @returns {Object}
 */
export default async function overturn(data, feed) {
    const { ezs } = this;
    const size = Number(this.getParam('size', 1));
    const path = this.getParam('path');
    const location = this.getParam('location', tmpdir());

    if (this.isFirst()) {
        const commands = ezs.createCommands({
            file: this.getParam('file'),
            script: this.getParam('script'),
            command: this.getParam('command'),
            commands: this.getParam('commands'),
            prepend: this.getParam('prepend'),
            append: this.getParam('append'),
        });
        this.bufferID = await generate(nolookalikes, 10);
        this.cachePath = resolvePath(location, 'memory', 'overturn');
        if (!pathExists.sync(this.cachePath)) {
            makeDir.sync(this.cachePath);
        }
        this.buffer = ezs.createStream(ezs.objectMode());

        this.whenCacheFilled = new Promise((resolve, reject) => {
            this.buffer
                .pipe(ezs('expand', {
                    path,
                    size,
                    commands,
                    token: [this.bufferID, 0 ],
                    location,
                }, this.getEnv()))
                .pipe(ezs('pack'))
                .pipe(cacache.put.stream(
                    this.cachePath,
                    this.bufferID,
                ))
                .on('data', () => {})
                .once('error', () => reject())
                .once('end', () => resolve())
            ;
        });
    }
    if (this.isLast()) {
        this.buffer.end();
        await this.whenCacheFilled;
        const commands = ezs.createCommands({
            file: this.getParam('file'),
            script: this.getParam('script'),
            command: this.getParam('command'),
            commands: this.getParam('commands'),
            prepend: this.getParam('prepend'),
            append: this.getParam('append'),
        });

        const output = cacache.get.stream(this.cachePath, this.bufferID)
            .pipe(ezs('unpack'))
            .pipe(ezs('expand', {
                path,
                size,
                commands,
                token: [this.bufferID, 1],
                location,
            }, this.getEnv()))
            .pipe(ezs.catch((e) => feed.write(e)));  // avoid to break pipeline at each error
        await feed.flow(output);
        feed.close();
        await cacache.rm.entry(this.cachePath, this.bufferID);
        return;
    }

    const value = _.get(data, path);
    if (!value || value.length === 0) {
        feed.send(data);
        return;
    }
    ezs.writeTo(this.buffer, data, () => feed.end());
}
