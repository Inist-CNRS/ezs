import get from 'lodash.get';
import uniq from 'lodash.uniq';
import core from './core';

const equalTo = (id) => (item) => item.id.some((key) => key === id);
/**
 * Take `Object` like `{ id, value }` and reduce all values with the same `id`
 * in a single object
 *
 * ```json
 * [
 *    { "id": "lorem", "value": 1 },
 *    { "id": "Lorem", "value": 1 },
 *    { "id": "loren", "value": 1 },
 *    { "id": "korem", "value": 1 },
 *    { "id": "olrem", "value": 1 },
 *    { "id": "toto", "value": 1 },
 *    { "id": "titi", "value": 1 },
 *    { "id": "lorem", "value": 1 }
 * ]
 * ```
 *
 * Script:
 *
 * ```ini
 * [use]
 * plugin = analytics
 *
 * [groupingByEquality]
 *
 * [summing]
 *
 * ```
 *
 * Output:
 *
 * ```json
 * [
 *   { "id": [ "lorem" ], "value": 2 },
 *   { "id": [ "Lorem" ], "value": 1 },
 *   { "id": [ "loren" ], "value": 1 },
 *   { "id": [ "korem" ], "value": 1 },
 *   { "id": [ "olrem" ], "value": 1 },
 *   { "id": [ "toto" ], "value": 1 },
 *   { "id": [ "titi" ], "value": 1 }
 * ]
 * ```
 *
 * @name groupingByEquality
 * @param {String} [id=id] path to use for id
 * @param {String} [value=value] path to use for value
 * @returns {Object}
 */
export default function groupingByEquality(data, feed) {
    if (!this.stats) {
        this.stats = [];
    }
    if (this.isLast()) {
        this.stats.forEach((key) => feed.write(core(key.id, key.value)));
        feed.close();
        return;
    }
    const id = get(data, this.getParam('id', 'id')) || this.getIndex();
    const value = get(data, this.getParam('value', 'value'));
    const finder = equalTo(id);
    if (id && value) {
        const idx = this.stats.findIndex(finder);
        if (idx === -1) {
            this.stats.push(core([id], [value]));
        } else {
            this.stats[idx].id.push(id);
            this.stats[idx].id = uniq(this.stats[idx].id);
            this.stats[idx].value.push(value);
        }
    }

    feed.end();
}
