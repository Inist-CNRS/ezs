import { get } from 'lodash';
import core from './core';
/**
 * Take special `Object` like `{id, value}` and replace `value` with the max of `value`s
 *
 * ```json
 * [
 *   { id: 'toul', value: [1, 2, 3] },
 *   { id: 'nancy', value: [2, 3, 4] },
 *   { id: 'neufchateau', value: [3, 4, 5] },
 * ]
 * ```
 *
 * Script:
 *
 * ```ini
 * [use]
 * plugin = analytics
 *
 * [maximizing]
 *
 * ```
 *
 * Output:
 *
 * ```json
 * [
 *    { "id": "toul", "value": 3 },
 *    { "id": "nancy", "value": 4 },
 *    { "id": "neufchateau", "value": 5 }
 * ]
 * ```
 *
 * @name maximizing
 * @param {String} [id=id] path to use for id
 * @param {String} [value=value] path to use for value
 * @returns {Object}
 */
export default function maximizing(data, feed) {
    if (this.isLast()) {
        feed.close();
        return;
    }
    const id = get(data, this.getParam('id', 'id')) || this.getIndex();
    const value = get(data, this.getParam('value', 'value'));
    const values = Array.isArray(value) ? value : [value];
    if (id && value) {
        feed.write(core(id, values.map((x) => Number(x)).reduce((a, b) => (a > b ? a : b))));
    }
    feed.end();
}
