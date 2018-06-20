import get from 'lodash.get';
import core from './core';
/**
 * Take `Object` and take values with [value] path (must be an array)
 * and throw object of each value. The new object is build with [id] and eac value.
 *
 * @name reducing
 * @param {String} [id=id] path to use for id
 * @param {String} [value=value] path to use for value
 * @returns {Object}
 */
export default function exploding(data, feed) {
    if (this.isLast()) {
        feed.close();
        return;
    }
    const id = get(data, this.getParam('id', 'id'));
    const value = get(data, this.getParam('value', 'value'));
    const values = Array.isArray(value) ? value : [value];
    if (id && value) {
        values.forEach(val => feed.write(core(id, val)));
    }

    feed.end();
}
