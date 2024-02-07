import { get } from 'lodash';
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
 * @param {String} [identifier=false] path to use to set value result field (if not set or not exists, 1 is use as a default value)
 * @returns {Object}
 */
export default function graph(data, feed) {
    if (this.isLast()) {
        feed.close();
        return;
    }
    const path = this.getParam('path', []);
    const idt = this.getParam('identifier', false);
    const weight = idt === false ? 1 : get(data, idt, 1);
    const values = [].concat(path)
        .map((key) => get(data, key))
        .filter((x) => x)
        .map((item) => (item instanceof Array ? item : [item]))
        .reduce((pre, cur) => pre.concat(cur), [])
        .filter(Boolean)
        .sort();

    values.forEach(
        (v, i) => values
            .slice(i + 1)
            .forEach((w) => feed.write(core([v, w], weight))),
    );
    feed.end();
}
