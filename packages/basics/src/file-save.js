import { createWriteStream, lstat } from 'fs';
import { createGzip } from 'zlib';
import path from 'path';
import { tmpdir } from 'os';
import pathExists from 'path-exists';
import makeDir from 'make-dir';
import writeTo from 'stream-write';




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
 * @param {Boolean} [compress=false] Enable gzip compression
 * @returns {Object}
 */
export default async function FILESave(data, feed) {
    if (!this.handle) {
        const identifier = String(this.getParam('identifier'));
        const location = this.getParam('location', tmpdir());
        const compress = this.getParam('compress', false);
        if (!pathExists.sync(location)) {
            makeDir.sync(location);
        }

        if (compress) {
            this.filename = path.resolve(location, `${identifier}.gz`);
            this.handle = createGzip();
            this.handleEnd = this.handle.pipe(createWriteStream(this.filename));

        } else {
            this.filename = path.resolve(location, identifier);
            this.handle = createWriteStream(this.filename);
            this.handleEnd = this.handle;
        }
    }
    if (this.isLast()) {
        this.handleEnd.on('close', () => {
            lstat(this.filename, (err, stat) => {
                feed.write({ filename: this.filename, ...stat });
                return feed.close();
            });
        });
        return this.handle.end();
    }
    writeTo(this.handle, Buffer.from(String(data)), () => feed.end());
}
