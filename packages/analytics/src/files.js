import { existsSync, createReadStream } from 'fs';
import { resolve } from 'path';

/**
 * Take `Object` containing filename et throw content by chunk
 *
 * Note : files must be under the working directory of the Node.js process.
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
 * [files]
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
 * @name files
 * @param {String} [location=.] path location to find files
 * @returns {Object}
 */
export default function files(data, feed) {
    if (this.isLast()) {
        feed.close();
        return;
    }
    const cwd = process.cwd();
    const location = this.ezs.getPath().concat(this.getParam('location'));
    const file = location
        .filter(Boolean)
        .map((dir) => resolve(dir, String(data).trim()))
        .filter((fil) => (fil.indexOf(cwd) === 0 && existsSync(fil)))
        .shift();
    if (!file) {
        feed.end();
        return;
    }
    feed.flow(createReadStream(file));
}
