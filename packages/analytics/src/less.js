import get from 'lodash.get';

/**
 * Take `Object` and throw the same object only if the value of the selected
 * field is less (or equal) than a value
 *
 * ```json
 * [{
 *           { id: 2000, value: 1 },
 *           { id: 2001, value: 2 },
 *           { id: 2003, value: 3 },
 *           { id: 2005, value: 4 },
 *           { id: 2007, value: 5 },
 *           { id: 2009, value: 6 },
 *           { id: 2011, value: 7 },
 *           { id: 2013, value: 8 },
 * }]
 * ```
 *
 * Script:
 *
 * ```ini
 * [use]
 * plugin = analytics
 *
 * [less]
 * path = value
 * than = 4
 *
 * ```
 *
 * Output:
 *
 * ```json
 * [{
 *    "id": 2000,
 *    "value": 1
 * },
 * {
 *    "id": 2001,
 *   "value": 2
 * },
 * {
 *    "id": 2003,
 *    "value": 3
 * },
 * {
 *    "id": 2005,
 *    "value": 4
 * }]
 * ```
 *
 * @name less
 * @param {String} [path=value] path of the field to compare
 * @param {Number} [than=0] value to compare
 * @param {Boolean} [strict=false] less than but not equal
 * @returns {Object}
 */
export default function less(data, feed) {
    if (this.isLast()) {
        feed.close();
        return;
    }
    const strict = Boolean(this.getParam('strict', false));
    const than = Number(this.getParam('than')) || 0;
    const path = this.getParam('path', 'value');
    const key = Array.isArray(path) ? path.shift() : path;
    const value = Number(get(data, key)) || 0;

    if ((!strict && value <= than) || (strict && value < than)) {
        feed.send(data);
    } else {
        feed.end();
    }
}
