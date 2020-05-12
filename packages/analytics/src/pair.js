import get from 'lodash.get';
import core from './core';

/**
 * Take `Object` object getting some fields with json path, and
 * throw all pair of value from two fields
 *
 * ```json
 * [
 *  { departure: ['tokyo', 'nancy'], arrival: 'toul' },
 *  { departure: ['paris', 'nancy'], arrival: 'toul' },
 *  { departure: ['london', 'berlin'], arrival: 'toul' },
 * ]
 * ```
 *
 * Script:
 *
 * ```ini
 * [use]
 * plugin = analytics
 *
 * [pair]
 * path = departure
 * path = arrival
 *
 * ```
 *
 * Output:
 *
 * ```json
 * [
 *  { "id": [ "tokyo", "toul" ], "value": 1 },
 * { "id": [ "nancy", "toul" ], "value": 1 },
 * { "id": [ "paris", "toul" ], "value": 1 },
 *  { "id": [ "nancy", "toul" ], "value": 1 },
 *  { "id": [ "london", "toul" ], "value": 1 },
 *  { "id": [ "berlin", "toul" ], "value": 1 }
 * ]
 * ```
 *
 * @name pair
 * @param {String} path
 * @returns {Object}
 */
export default function pair(data, feed) {
    if (this.isLast()) {
        feed.close();
        return;
    }
    let fields = this.getParam('path', []);
    if (!Array.isArray(fields)) {
        fields = [fields];
    }

    const values = fields
        .map((key) => get(data, key))
        .filter((x) => x)
        .map((item) => (item instanceof Array ? item : [item]));

    values
        .forEach((v, i) => {
            const a = values.slice(i + 1).reduce((pre, cur) => pre.concat(cur), []);
            if (a.length > 0) {
                v.forEach((w) => {
                    a.forEach((x) => feed.write(core([w, x], 1)));
                });
            }
        });

    feed.end();
}
