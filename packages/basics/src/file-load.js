import { createGunzip } from 'zlib';
import { existsSync, createReadStream } from 'fs';
import { resolve } from 'path';
import { tmpdir } from 'os';

/**
 * Take `Object` containing filename et throw content by chunk
 *
 * ```json
 * [ fi1e1.csv, file2.csv ]
 * ```
 *
 * Script:
 *
 * ```ini
 * [use]
 * plugin = analytics
 * plugin = basics
 *
 * [FILELoad]
 * [CSVParse]
 *
 * ```
 *
 * Output:
 *
 * ```json
 * [
 * (...)
 * ]
 * ```
 *
 * @name FILELoad
 * @param {String} [location=TMPDIR] Directory location
 * @param {String} [identifier] File name
 * @param {Boolean} [compress=false] Enable gzip compression
 * @returns {Object}
 */
export default function FILELoad(data, feed) {
    if (this.isLast()) {
        feed.close();
        return;
    }
    const cwd = process.cwd();
    const tpd = tmpdir();
    const identifier = String(this.getParam('identifier'));
    const location = this.getParam('location', tpd);
    const compress = this.getParam('compress', false);
    const locations = this.ezs.getPath().concat(location);
    const file = locations
        .filter(Boolean)
        .map((dir) => resolve(dir, String(data).trim()))
        .filter((fil) => ((fil.indexOf(cwd) === 0 || fil.indexOf(tpd) === 0) && existsSync(fil)))
        .shift();
    if (!file) {
        feed.end();
        return;
    }
    if (compress) {
        this.filename = resolve(location, `${identifier}.gz`);
        feed.flow(createReadStream(file).pipe(createGunzip()));
        return;
    }
    feed.flow(createReadStream(file));
}
