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
 * @returns {Array<any>}
 */
export default function ungroup(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const values = Array.isArray(data) ? data : [data];
    values.forEach((value) => feed.write(value));
    return feed.end();
}
