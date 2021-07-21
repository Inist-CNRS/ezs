import _ from 'lodash';

/**
 * Add a new field to an `Object`.
 *
 * Input file:
 *
 * ```json
 * [{
 *    "a": 1,
 * },
 * {
 *    "a": 2,
 * },
 * {
 *    "a": 3,
 * },
 * {
 *    "a": 4,
 * },
 * {
 *    "a": 5,
 * }]
 * ```
 *
 * Script:
 *
 * ```ini
 * [assign]
 * path = b.c
 * value = 'X'
 *
 * ```
 *
 * Output:
 *
 * ```json
 * [{
 *    "a": 1,
 *    "b": { "c": "X" },
 * },
 * {
 *    "a": 2,
 *    "b": { "c": "X" },
 * },
 * {
 *    "a": 3,
 *    "b": { "c": "X" },
 * },
 * {
 *    "a": 4,
 *    "b": { "c": "X" },
 * },
 * {
 *    "a": 5,
 *    "b": { "c": "X" },
 * }]
 * ```
 *
 * @name assign
 * @param {String} [path] path of the new field
 * @param {String} [value] value of the new field
 * @returns {Object}
 */
export default function assign(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const path = this.getParam('path', []);
    const value = this.getParam('value');
    const vals = Array.isArray(path) && !Array.isArray(value) ? [value] : value;
    if (Array.isArray(path)) {
        const values = _.take(vals, path.length);
        const assets = _.zipObject(path, values);
        Object.keys(assets).forEach((key) => {
            _.set(data, key, assets[key]);
        });
    } else {
        _.set(data, path, vals);
    }
    return feed.send(data);
}
