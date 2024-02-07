import { get, uniq } from 'lodash';
import core from './core';
import { levenshteinDistance } from './algorithms';

const equalTo = (id, distance) => (item) => item.id.some((key) => levenshteinDistance(key, id) <= distance);

/**
 * Take `Object` like `{ id, value }` and reduce all `value`s with
 * `id` which have the same Levenshtein distance in a single object
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
 * [groupingByLevenshtein]
 * distance = 2
 *
 * [summing]
 *
 * ```
 *
 * Output:
 *
 * ```json
 * [
 *    { "id": [ "lorem", "Lorem", "loren", "korem", "olrem" ], "value": 6 },
 *    { "id": [ "toto", "titi" ], "value": 2 }
 * ]
 * ```
 *
 * @name groupingByLevenshtein
 * @param {String} [id=id] path to use for id
 * @param {String} [value=value] path to use for value
 * @param {Number} [distance=1] minimal levenshtein distance to have a same id
 * @returns {Object}
 */
export default function groupingByLevenshtein(data, feed) {
    if (!this.stats) {
        this.stats = [];
    }
    if (this.isLast()) {
        this.stats.forEach((key) => feed.write(core(key.id, key.value)));
        feed.close();
        return;
    }
    const distance = Number(this.getParam('distance', 1)) || 1;
    const id = get(data, this.getParam('id', 'id')) || this.getIndex();
    const value = get(data, this.getParam('value', 'value'));
    const finder = equalTo(id, distance);
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
