import get from 'lodash.get';
import core from './core';
/**
 * Take special `Object` like {_id, value} and replace value with the min of values
 *
 * @name minimizing
 * @returns {Object}
 */
export default function minimizing(data, feed) {
    if (this.isLast()) {
        feed.close();
        return;
    }
    const id = get(data, this.getParam('id', 'id'));
    const value = get(data, this.getParam('value', 'value'));
    const values = Array.isArray(value) ? value : [value];
    if (id && value) {
        feed.write(core(id, values.map(x => Number(x)).reduce((a, b) => (a < b ? a : b))));
    }
    feed.end();
}
