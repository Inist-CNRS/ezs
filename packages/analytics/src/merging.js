import get from 'lodash.get';
import core from './core';
/**
 * Take special `Object` like {_id, value} and replace value with the merge of values
 *
 * @name mergin
 * @param {String} [id=id] path to use for id
 * @param {String} [value=value] path to use for value
 * @returns {Object}
 */
export default function merging(data, feed) {
    if (this.isLast()) {
        feed.close();
        return;
    }
    const id = get(data, this.getParam('id', 'id'));
    const value = get(data, this.getParam('value', 'value'));
    const values = Array.isArray(value) ? value : [value];
    if (id && value) {
        feed.write(core(id,
            values
                .filter(k => typeof k === 'object')
                .reduce((prev, cur) => Object.assign(prev, cur), {})));
    }
    feed.end();
}
