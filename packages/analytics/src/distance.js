import { get } from 'lodash';
import { levenshteinDistance } from './algorithms';

/**
 * To compare 2 fields with 2 id and compute a distance
 *  - for arrays, the distance is calculated according to the number of element in common
 *
 * ```json
 * [{
 *            {
 *               id_of_a: 1,
 *               id_of_b: 2,
 *               a: ['x', 'y'],
 *               b: ['x', 'z'],
 *           },
 *           {
 *               id_of_a: 1,
 *               id_of_b: 3,
 *               a: ['x', 'y'],
 *               b: ['y', 'z'],
 *           },
 *           {
 *               id_of_a: 1,
 *               id_of_b: 4,
 *               a: ['x', 'y'],
 *               b: ['z'],
 *           },
 *           {
 *               id_of_a: 1,
 *               id_of_b: 5,
 *               a: ['x', 'y'],
 *               b: ['x', 'y', 'z'],
 *           },
 *           {
 *               id_of_a: 1,
 *               id_of_b: 6,
 *               a: ['x', 'y'],
 *               b: ['x', 'y'],
 *           },
 * }]
 * ```
 *
 * Script:
 *
 * ```ini
 * [use]
 * plugin = analytics
 *
 * [distance]
 * id = id_of_a
 * id = id_of_b
 * value = a
 * value = b
 *
 * ```
 *
 * Output:
 *
 * ```json
 * [
 *     { id: [ 1, 2 ], value: 0.5 },
 *     { id: [ 1, 3 ], value: 0.5 },
 *     { id: [ 1, 4 ], value: 0 },
 *     { id: [ 1, 5 ], value: 0.8 },
 *     { id: [ 1, 6 ], value: 1 }
 *   ]
 *
 * ]
 * ```
 *
 * @name distance
 * @param {String} [path=value] path
 * @returns {Object}
 */
export default function distance(data, feed) {
    if (this.isLast()) {
        feed.close();
        return;
    }
    const idPath = this.getParam('id', 'id');
    let id1;
    let id2;
    if (Array.isArray(idPath)) {
        [id1, id2] = idPath.map((f) => get(data, f));
    } else {
        [id1, id2] = get(data, idPath);
    }
    const valuePath = this.getParam('value', 'value');
    let value1;
    let value2;
    if (Array.isArray(valuePath)) {
        [value1, value2] = valuePath.map((f) => get(data, f));
    } else {
        [value1, value2] = get(data, valuePath);
    }
    if (Array.isArray(value1) && Array.isArray(value2)) {
        const measurement = value1.map((val) => (value2.indexOf(val) >= 0 ? 1 : 0)).reduce((a, b) => a + b, 0);
        const value = ((measurement * 200) / (value1.length + value2.length)) / 100;
        const result = {
            id: [id1, id2],
            value,
        };
        feed.send(result);
        return;
    }
    if (typeof value1 === 'string' && typeof value2 === 'string') {
        const measurement = levenshteinDistance(value1, value2);
        const value = ((measurement * 200) / (value1.length + value2.length)) / 100;
        const result = {
            id: [id1, id2],
            value: (1 - value),
        };
        feed.send(result);
        return;
    }
    if (typeof value1 === 'number' && typeof value2 === 'number') {
        const measurement = Math.min(value1, value2);
        const value = (((1 + measurement) * 200) / (value1 + value2 + 2)) / 100;
        const result = {
            id: [id1, id2],
            value,
        };
        feed.send(result);
        return;
    }
    feed.end();
}
