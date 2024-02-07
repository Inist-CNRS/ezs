import { get } from 'lodash';
import core from './core';
/**
 * Take special `Object` like `{id, value}` and replace `value` with the sum of
 * `value`s
 *
 * ```json
 * [
 *  { "id": "A", "value": [1, 1, 1] },
 *  { "id": "B", "value": [1] },
 *  { "id": "C", "value": [1, 1, 1, 1] },
 * ]
 * ```
 *
 * Script:
 *
 * ```ini
 * [use]
 * plugin = analytics
 *
 * [summing]
 *
 * ```
 *
 * Output:
 *
 * ```json
 * [{
 *   "id": "A", "value": 3
 * },
 * {
 *    "id": "B",
 *    "value": 1
 * },
 * {
 *    "id": "C",
 *   "value": 4
 * }]
 * ```
 *
 * @name summing
 * @param {String} [id=id] path to use for id
 * @param {String} [value=value] path to use for value
 * @returns {Object}
 */
export default function summing(data, feed) {
    if (this.isLast()) {
        feed.close();
        return;
    }
    const id = get(data, this.getParam('id', 'id')) || this.getIndex();
    const value = get(data, this.getParam('value', 'value'));
    const values = Array.isArray(value) ? value : [value];
    if (id && value) {
        feed.write(core(id, values.reduce((sum, x) => sum + Number(x), 0)));
    }
    feed.end();
}
