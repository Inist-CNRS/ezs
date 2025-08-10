import settings from '../settings.js';
import set  from 'lodash/set.js';

/**
 * Take all `chunk`s, and throw them grouped by `length`.
 *
 * See also {@link ungroup}.
 *
 * ```json
 * [
 *      "a",
 *      "b",
 *      "c",
 *      "d",
 *      "e",
 *      "f",
 *      "g",
 *      "h"
 * ]
 * ```
 *
 * Script:
 *
 * ```ini
 * [group]
 * length = 3
 * ```
 *
 * Output:
 *
 * ```json
 * [
 *      [ "a", "b", "c" ],
 *      [ "d", "e", "f" ],
 *      [ "g", "h" ]
 * ]
 * ```
 *
 * @name group
 * @param {Number} [size] Size of each partition (alias: length)
 * @param {String} [path] path to set with the array
 * @returns {String}
 */
export default function group(data, feed) {
    const len = Number(this.getParam('length', settings.highWaterMark.object));
    const size = Number(this.getParam('size', len));
    const path = [].concat(this.getParam('path', [])).filter(Boolean).shift();

    if (this.isFirst()) {
        this.buffer = [];
    }
    if (this.isLast()) {
        if (this.buffer && this.buffer.length > 0) {
            const buf = Array.from(this.buffer);
            feed.write(!path ? buf : set({}, path, buf));
        }
        return feed.close();
    }
    this.buffer.push(data);
    if (this.buffer.length >= size) {
        const buf = Array.from(this.buffer);
        this.buffer = [];
        return feed.send(!path ? buf : set({}, path, buf));
    }
    return feed.end();
}
