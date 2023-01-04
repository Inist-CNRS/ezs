import flatten, { unflatten } from 'flat';

/**
 * Flatten an `Object` with a path delimiting character.
 *
 * See {@link https://www.npmjs.com/package/flat}
 *
 * Input:
 *
 * ```json
 * [
 *   { "a": { "b": 1, "c": 2}},
 *   { "a": { "b": 3, "c": 4}}
 * ]
 * ```
 *
 * Output:
 *
 * ```json
 * [
 *   { "a/b": 1, "a/c": 2 },
 *   { "a/b": 3, "a/c": 4 }
 * ]
 * ```
 *
 * @name OBJFlatten
 * @param {String} [separator="/"] choose a character to flatten keys
 * @param {Boolean} [reverse=false] unflatten instead of flatten keys
 * @param {Boolean} [safe=false] preserve arrays and their contents,
 * @returns {Object}
 */
export default function OBJFlatten(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const opts = {
        delimiter: String(this.getParam('separator', '/')),
        safe: Boolean(this.getParam('safe', true)),
    };
    if (this.getParam('reverse', false)) {
        return feed.send(unflatten(data, opts));
    }
    return feed.send(flatten(data, opts));
}
