import get from 'lodash.get';
import uniq from 'lodash.uniq';
import core from './core';
import Store from './store';

/**
 * Take all `Object` and sort them with dedicated key
 *
 * @param {String} [path=id] path to use for id
 * @returns {Object}
 */
export default function sort(data, feed) {
    if (!this.store) {
        this.store = new Store('sort');
    }
    if (this.isLast()) {
        this.store.cast()
            .on('data', item => feed.write(item))
            .on('end', () => feed.close());
    } else {
        const path = this.getParam('path', 'id');
        const fields = Array.isArray(path) ? path : [path];
        const values = fields
            .filter(k => typeof k === 'string')
            .map(key => get(data, key))
        const key = fields.length > 1 ? values.join(',') : values[0];

        this.store.put(key, data).then(() => feed.end());
    }
}
