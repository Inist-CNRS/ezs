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
        const reverse = this.getParam('reverse', false);
        this.store.cast({ reverse })
            .on('data', item => feed.write(item.value))
            .on('end', () => feed.close());
    } else {

        const path = this.getParam('path', 'id');
        const fields = Array.isArray(path) ? path : [path];
        const values = fields
            .filter(k => typeof k === 'string')
            .map(key => get(data, key))
            .map(val => typeof val === 'number' ? val.toFixed(20).toString() : String(val).slice(0,20).padEnd(20, '~'))
        const key = fields.length > 1 ? values.join(',') : values[0];
        const idx = this.getIndex().toString().padStart(20, '0');
        const hash = key.concat('~').concat(idx);
        this.store.put(hash, data).then(() => feed.end());
    }
}
