import _ from 'lodash';
/**
 * Throw input `Object` but keep only specific fields.
 *
 * Input file:
 *
 * ```json
 * [{
 *    "a": "abcdefg",
 *    "b": "1234567",
 *    "c": "XXXXXXX"
 * },
 * {
 *    "a": "abcdefg",
 *    "b": "1234567",
 *    "c": "XXXXXXX"
 * }]
 * ```
 *
 * Script:
 *
 * ```ini
 * [keep]
 * path = a
 * path = b
 * ```
 *
 * Output:
 *
 * ```json
 * [{
 *    "a": "abcdefg",
 *    "b": "1234567"
 * },
 * {
 *    "a": "abcdefg",
 *    "b": "1234567"
 * }]
 * ```
 *
 * @name keep
 * @param {String} [path] path of field to keep
 * @returns {Object}
 */
export default function keep(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    let keys = this.getParam('path', []);
    if (!Array.isArray(keys)) {
        keys = [keys];
    }
    const obj = {};
    keys.filter((k) => typeof k === 'string').forEach((key) => _.set(obj, key, _.get(data, key)));
    return feed.send(obj);
}
