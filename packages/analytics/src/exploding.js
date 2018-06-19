import get from 'lodash.get';
import core from './core';
/**
 * Take `Object` and ungroup values (must be an array) from { _id, value }
 * and throw all item in new object { _id, value }
 *
 * @name reducing
 * @param {undefined} none
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
