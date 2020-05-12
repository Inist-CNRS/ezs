import core from './core';
/**
 * Take `Object` and throws all its keys
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
 * [keys]
 * [aggregate]
 * [summing]
 *
 * ```
 *
 * Output:
 *
 * ```json
 * [
 * {
 *    "id": "city",
 *    "value": 8
 * },
 * {
 *   "id": "year",
 *   "value": 8
 * },
 * {
 *    "id": "count",
 *    "value": 8
 * }⏎
 * ]
 * ```
 *
 * @name keys
 * @param {String} path
 * @returns {Object}
 */
export default function keys(data, feed) {
    if (this.isLast()) {
        feed.close();
        return;
    }
    Object.keys(data)
        .forEach((item) => feed.write(core(item, 1)));
    feed.end();
}
