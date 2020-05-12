import get from 'lodash.get';
import core from './core';

/**
 * Take `Object` and throw a new special object (id, value) for each combination of values
 *
 * ```json
 * [
 *  { cities: ['berlin', 'nancy', 'toul'] },
 *  { cities: ['paris', 'nancy', 'toul']},
 *  { cities: ['paris', 'berlin', 'toul'] },
 * }]
 * ```
 *
 * Script:
 *
 * ```ini
 * [use]
 * plugin = analytics
 *
 * [graph]
 * path = cities
 *
 * ```
 *
 * Output:
 *
 * ```json
 * [
 *   { "id": [ "berlin", "nancy" ], "value": 1 },
 *   { "id": [ "berlin", "toul" ], "value": 2 },
 *   { "id": [ "nancy", "toul" ], "value": 2 },
 *   { "id": [ "nancy", "paris" ], "value": 1 },
 *   { "id": [ "paris", "toul" ], "value": 2 },
 *   { "id": [ "berlin", "paris" ], "value": 1 }
 * ]
 * ```
 *
 * @name graph
 * @param {String} path
 * @returns {Object}
 */
export default function graph(data, feed) {
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
        .map((item) => (item instanceof Array ? item : [item]))
        .reduce((pre, cur) => pre.concat(cur), [])
        .sort();

    values.forEach(
        (v, i) => values
            .slice(i + 1)
            .forEach((w) => feed.write(core([v, w], 1))),
    );
    feed.end();
}
