import get  from 'lodash/get.js';
/**
 * Take all `chunk`s, and throw one item for every chunk.
 *
 * See also {@link group}.
 *
 * ```json
 * [
 *      [ "a", "b", "c" ],
 *      [ "d", "e", "f" ],
 *      [ "g", "h" ]
 * ]
 * ```
 *
 * Script:
 *
 * ```ini
 * [ungroup]
 * ```
 *
 * Output:
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
 * @name ungroup
 * @param {String} [path] path to get the array
 * @returns {Array<any>}
 */
export default function ungroup(data, feed) {
    const path = [].concat(this.getParam('path', [])).filter(Boolean).shift();
    if (this.isLast()) {
        return feed.close();
    }
    const input = !path ? data : get(data, path, []);
    const values = Array.isArray(input) ? input : [input];
    values.forEach((value) => feed.write(value));
    return feed.end();
}
