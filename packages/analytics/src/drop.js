import get from 'lodash.get';

/**
 * Take `Object` and throw the same object only if there the value of the select field is not equals than a value
 *
 * @name drop
 * @param {String} [path="value"] path of the field to compare
 * @param {Number} [if=""] value to compare
 * @returns {Object}
 */
export default function drop(data, feed) {
    if (this.isLast()) {
        feed.close(); return;
    }
    const path = this.getParam('path', 'value');
    const paths = Array.isArray(path) ? path : [path];
    const condition = this.getParam('if', []);
    const conditions = Array.isArray(condition) ? condition : [condition];

    if (conditions.length === 0) {
        conditions.push('', null, undefined);
    }

    if (paths.map((p) => conditions.indexOf(get(data, p)) !== -1).indexOf(true) !== -1) {
        feed.end();
    } else {
        feed.send(data);
    }
}
