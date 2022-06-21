import { createWriteStream } from 'fs';
import { lstat } from 'fs/promises';
import path from 'path';
import { tmpdir } from 'os';
import pathExists from 'path-exists';
import makeDir from 'make-dir';
import debug from 'debug';
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
 * ["/tmp/truc.json"]
 * ```
 *
 * @name FILESave
 * @param {String} [location=TMPDIR] Directory location
 * @param {Number} [identifier] File name
 * @returns {Object}
 */
export default async function FILESave(data, feed) {
    if (!this.handle) {
        const identifier = String(this.getParam('identifier'));
        const location = this.getParam('location', tmpdir());
        if (!pathExists.sync(location)) {
            makeDir.sync(location);
        }
        this.filename = path.resolve(location, identifier);
        this.handle = createWriteStream(this.filename);
    }
    if (this.isLast()) {
        this.handle.close();
        const stat = await lstat(this.filename);
        feed.write({ filename: this.filename, ...stat });
        return feed.close();
    }
    writeTo(this.handle, Buffer.from(String(data)), () => feed.end());
}
