import get from 'lodash.get';
import core from './core';
/**
 * Take `Object` and throw special `Object` like `{id, value}` if key(s) was found
 * id is the key, value is equal to 1 (if found)
 *
 * ```json
 * [
 *  {
 *       "a": "nancy",
 *       "b": "lucy",
 *       "c": "geny",
 *   },
 *   {
 *       "a": "lorem",
 *       "b": "loret",
 *   },
 *   {
 *       "a": "fred",
 *   }
 * ]
 * ```
 *
 * Script:
 *
 * ```ini
 * [use]
 * plugin = analytics
 *
 * [count]
 * path = a
 * path = b
 * path = c
 *
 * [aggregate]
 * [summing]
 *
 * ```
 *
 * Output:
 *
 * ```json
 * [{
 *    "id": "a",
 *    "value": 3
 * },
 * {
 *    "id": "b",
 *    "value": 2
 * },
 * {
 *    "id": "c",
 *    "value": 1
 * }]
 * ```
 *
 * @name count
 * @param {String} path
 * @returns {Object}
 */
export default function count(data, feed) {
    if (this.isLast()) {
        feed.close();
        return;
    }
    let fields = this.getParam('path', []);
    if (!Array.isArray(fields)) {
        fields = [fields];
    }

    fields
        .filter((k) => typeof k === 'string')
        .filter((key) => get(data, key))
        .filter((x) => x)
        .forEach((item) => feed.write(core(item, 1)));
    feed.end();
}
