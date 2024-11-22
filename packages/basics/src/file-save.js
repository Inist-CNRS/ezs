import { createWriteStream, lstat, accessSync, constants } from 'fs';
import { createGzip } from 'zlib';
import path from 'path';
import { tmpdir } from 'os';
import pathExists from 'path-exists';
import makeDir from 'make-dir';
import writeTo from 'stream-write';
import debug from 'debug';

const eol = '\n';
const toJSONL = (line) => JSON.stringify(line).concat(eol);
/**
 * Take data, convert it to buffer and append it to file
 *
 * #### Example
 *
 * Input:
 *
 * ```json
 * [
 *   {"a": "a"},
 *   {"a": "b"},
 *   {"a": "c" }
 * ]
 * ```
 *
 * Script:
 *
 * ```ini
 * [FILESave]
 * location = /tmp
 * identifier = toto
 * ```
 *
 * Output:
 *
 * ```json
 * [{ filename: "/tmp/toto", size: XXX, ... }]
 * ```
 *
 * @name FILESave
 * @param {String} [location=TMPDIR] Directory location
 * @param {String} [identifier] File name
 * @param {String} [content] Content to save instead of using input object
 * @param {Boolean} [jsonl=false] Save as json line
 * @param {Boolean} [compress=false] Enable gzip compression
 * @returns {Object}
 */
export default function FILESave(data, feed) {
    if (this.isFirst()) {
        const identifier = String(this.getParam('identifier'));
        const location = path.normalize(this.getParam('location', tmpdir()));
        const compress = this.getParam('compress', false);
        if (location.indexOf(tmpdir()) !== 0 && location.indexOf(process.cwd()) !== 0) {
            feed.stop(new Error('File location check failed.'));
            return;
        }
        if (!pathExists.sync(location)) {
            makeDir.sync(location);
        }
        accessSync(location, constants.R_OK | constants.W_OK);
        const name = compress ? `${identifier}.gz` : identifier;
        const filename = path.resolve(location, name);
        this.input = compress ? createGzip() : createWriteStream(filename);
        this.whenFinish = new Promise((resolve, reject) => {
            const output = compress ? this.input.pipe(createWriteStream(filename)) : this.input;
            output.once('error', (err) => {
                debug('ezs:warn')(`File ${filename} not saved.`, this.ezs.serializeError(err));
                reject(err);
            });
            output.once('close', () => {
                debug('ezs:info')(`${filename} saved.`);
                lstat(filename, (err, stat) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve({ filename, ...stat });
                });
            });
        });
    }
    if (this.isLast()) {
        this.input.end();
        this.whenFinish
            .then((stats) => feed.write(stats))
            .catch((err) => feed.stop(err))
            .finally(() => feed.close());
        return;
    }
    const jsonl = Boolean(this.getParam('jsonl', false));
    const bufContent = this.getParam('content', data);
    const bufFunc = jsonl ? toJSONL : String;
    const buf = Buffer.isBuffer(bufContent) ? bufContent : Buffer.from(bufFunc(bufContent));
    writeTo(this.input, buf, () => feed.end());
}
