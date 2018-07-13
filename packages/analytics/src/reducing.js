import get from 'lodash.get';
import Store from './store';
import core from './core';
/**
 * Take `Object` group value of { id, value } objectpath
 *
 * @param {String} [id=id] path to use for id
 * @param {String} [value=value] path to use for value
 * @returns {Object}
 */
export default function reducing(data, feed) {
    if (!this.store) {
        this.store = new Store('reducing');
    }
    if (this.isLast()) {
        this.store.cast()
            .on('data', item => feed.write(item))
            .on('end', () => feed.close());
    } else {
        const id = get(data, this.getParam('id', 'id'));
        const value = get(data, this.getParam('value', 'value'));
        this.store.add(id, value).then(() => feed.end());
    }
}
