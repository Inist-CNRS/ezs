import get from 'lodash.get';

/**
 * Take `Object` and throw the same object only if there the value of the select field is equals than a value
 *
 *  * ```json
 * [
 *           { id: 2000, value: 1 },
 *           { id: 2001, value: 2 },
 *           { id: 2003, value: 3 },
 *           { id: 2005, value: 4 },
 *           { id: 2007, value: 5 },
 *           { id: 2003, value: 3 },
 *           { id: 2011, value: 7 },
 *           { id: 2013, value: 8 },
 * ]
 * ```
 *
 * Script:
 *
 * ```ini
 * [use]
 * plugin = analytics
 *
 * [filter]
 * path = id
 * if = 2003
 * if = 2013
 *
 * ```
 *
 * Output:
 *
 * ```json
 *  [
 *           { id: 2003, value: 3 },
 *           { id: 2003, value: 3 },
 *           { id: 2013, value: 8 },
 *  ]
 * ```
 *
 * @name filter
 * @param {String} [path="value"] path of the field to compare
 * @param {Number} [if=""] value to compare
 * @returns {Object}
 */
export default function filter(data, feed) {
    if (this.isLast()) {
        feed.close(); return;
    }
    const path = this.getParam('path', 'value');
    const paths = Array.isArray(path) ? path : [path];
    const condition = this.getParam('if') || [];
    const conditions = Array.isArray(condition) ? condition : [condition];

    if (conditions.length === 0) {
        conditions.push('', null, undefined);
    }

    if (paths.map((p) => conditions.indexOf(get(data, p)) !== -1).indexOf(true) !== -1) {
        feed.send(data);
    } else {
        feed.end();
    }
}
