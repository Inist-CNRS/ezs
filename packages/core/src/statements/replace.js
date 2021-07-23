import _ from 'lodash';

/**
 * Take `Object` and replace it with a new object with some fields.
 *
 * See also {@link exchange} and {@link assign}.
 *
 * Input file:
 *
 * ```json
 * [{
 *    "a": 1
 * },
 * {
 *    "a": 2
 * },
 * {
 *    "a": 3
 * },
 * {
 *    "a": 4
 * },
 * {
 *    "a": 5
 * }]
 * ```
 *
 * Script:
 *
 * ```ini
 * [replace]
 * path = b.c
 * value = 'X'
 * ```
 *
 * Output:
 *
 * ```json
 * [{
 *    "b": { "c": "X" }
 * },
 * {
 *    "b": { "c": "X" }
 * },
 * {
 *    "b": { "c": "X" }
 * },
 * {
 *    "b": { "c": "X" }
 * },
 * {
 *    "b": { "c": "X" }
 * }]
 * ```
 *
 * @name replace
 * @param {String} [path] path of the new field
 * @param {String} [value] value of the new field
 * @returns {Object}
 */
export default function replace(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const path = this.getParam('path', []);
    const value = this.getParam('value');
    const vals = Array.isArray(path) && !Array.isArray(value) ? [value] : value;
    const obj = {};
    if (Array.isArray(path)) {
        const values = _.take(vals, path.length);
        const assets = _.zipObject(path, values);
        Object.keys(assets).forEach((key) => {
            _.set(obj, key, assets[key]);
        });
    } else {
        _.set(obj, path, vals);
    }
    return feed.send(obj);
}
