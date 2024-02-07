import { get } from 'lodash';
import core from './core';
/**
 * Take `Object` object getting value of fields (with json `path`) and throws an
 * object for each value
 *
 * ```json
 * [
 *  { city: 'tokyo', year: 2000, count: 1 },
 *  { city: 'paris', year: 2001, count: 2 },
 *  { city: 'london', year: 2003, count: 3 },
 *  { city: 'nancy', year: 2005, count: 4 },
 *  { city: 'berlin', year: 2007, count: 5 },
 *  { city: 'madrid', year: 2009, count: 6 },
 *  { city: 'stockholm', year: 2011, count: 7 },
 *  { city: 'bruxelles', year: 2013, count: 8 },
 * ]
 * ```
 *
 * Script:
 *
 * ```ini
 * [use]
 * plugin = analytics
 *
 * [pluck]
 * path = year
 *
 * ```
 *
 * Output:
 *
 * ```json
 * [
 * { "id": "year", "value": 2000 },
 * { "id": "year", "value": 2001 },
 * { "id": "year", "value": 2003 },
 * { "id": "year", "value": 2005 },
 * { "id": "year", "value": 2007 },
 * { "id": "year", "value": 2009 },
 * { "id": "year", "value": 2011 },
 * { "id": "year", "value": 2013 }
 * ]
 * ```
 *
 * @name pluck
 * @param {String} [path=id] path to use form group by
 * @returns {Object}
 */
export default function pluck(data, feed) {
    if (this.isLast()) {
        feed.close();
        return;
    }
    let fields = this.getParam('path', 'id');
    if (!Array.isArray(fields)) {
        fields = [fields];
    }

    fields
        .filter((k) => typeof k === 'string')
        .map((key) => [key, get(data, key)])
        .filter((x) => x[1])
        .map((item) => ([item[0], (item[1] instanceof Array ? item[1] : [item[1]])]))
        .reduce((prev, cur) => prev.concat(cur[1].map((x) => ([cur[0], x]))), [])
        .forEach((item) => feed.write(core(item[0], item[1])));
    feed.end();
}
