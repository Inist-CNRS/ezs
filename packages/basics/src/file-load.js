import { createGunzip } from 'zlib';
import { existsSync, createReadStream, accessSync, constants } from 'fs';
import { resolve, dirname, normalize } from 'path';
import { tmpdir } from 'os';
import higherPath from 'higher-path';

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
export default async function FILELoad(data, feed) {
    if (this.isLast()) {
        feed.close();
        return;
    }
    const compress = this.getParam('compress', false);
    const location = normalize(this.getParam('location', '/'));
    const locations = [higherPath(tmpdir(), location), higherPath(process.cwd(), location)];
    const filename = locations
        .filter(Boolean)
        .map((dir) => resolve(dir, String(data).trim()))
        .filter((fil) => existsSync(fil))
        .shift();
    if (!filename) {
        feed.stop(new Error('File location check failed.'));
        return;
    }
    accessSync(dirname(filename), constants.R_OK | constants.W_OK);
    accessSync(filename, constants.R_OK | constants.W_OK);
    const stream = compress ? createReadStream(filename).pipe(createGunzip()) : createReadStream(filename);
    await feed.flow(stream);
    return;
}
