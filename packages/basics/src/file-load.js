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
 * location = /tmp
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
    const location = this.getParam('location', tpd);
    const compress = this.getParam('compress', false);
    const locations = [cwd, tpd, location];
    const file = locations
        .filter(Boolean)
        .map((dir) => resolve(dir, String(data).trim()))
        .filter((fil) => existsSync(fil))
        .shift();
    if (!file) {
        feed.end();
        return;
    }
    if (compress) {
        feed.flow(createReadStream(file).pipe(createGunzip()));
        return;
    }
    feed.flow(createReadStream(file));
}
