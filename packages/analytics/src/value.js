import { get } from 'lodash';

/**
 * Take `Object` object and getting the value field
 *
 * ```json
 * [
 *  { id: 2000, value: 1 },
 *  { id: 2001, value: 2 },
 *  { id: 2003, value: 3 },
 *  { id: 2005, value: 4 },
 *  { id: 2007, value: 5 },
 *  { id: 2009, value: 6 },
 *  { id: 2011, value: 7 },
 *  { id: 2013, value: 8 },
 * ]
 * ```
 *
 * Script:
 *
 * ```ini
 * [use]
 * plugin = analytics
 *
 * [value]
 * path = id
 *
 * ```
 *
 * Output:
 *
 * ```json
 * [
 * 2000,
 * 2001,
 * 2003,
 * 2005,
 * 2007,
 * 2009,
 * 2011,
 * 2013
 * ]
 * ```
 *
 * @name value
 * @param {String} [path=value] the pah of the value field
 * @returns {Object}
 */
export default function value(data, feed) {
    if (this.isLast()) {
        feed.close();
        return;
    }
    const path = this.getParam('path', 'value');
    const fields = Array.isArray(path) ? path : [path];

    const val = fields
        .filter((k) => typeof k === 'string')
        .map((key) => get(data, key))
        .filter((x) => x !== undefined)
        .filter((x) => x !== null)[0];

    feed.send(val);
}
