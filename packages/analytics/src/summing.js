import get from 'lodash.get';
import core from './core';
/**
 * Take special `Object` like {id, value} and replace value with the sum of values
 *
 * @param {String} [id=id] path to use for id
 * @param {String} [value=value] path to use for value
 * @returns {Object}
 */
export default function summing(data, feed) {
    if (this.isLast()) {
        feed.close();
        return;
    }
    const id = get(data, this.getParam('id', 'id'));
    const value = get(data, this.getParam('value', 'value'));
    const values = Array.isArray(value) ? value : [value];
    if (id && value) {
        feed.write(core(id, values.reduce((sum, x) => sum + Number(x), 0)));
    }
    feed.end();
}
