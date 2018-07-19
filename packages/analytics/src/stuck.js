import get from 'lodash.get';
import { store } from './globals';

/**
 * Take `Object` and throw the same object but stuck values of fields in a global store
 *
 * @param {String} [path] path of field to extract
 * @returns {Object}
 */
export default function stuck(data, feed) {
    if (this.isLast()) {
        return feed.send(data);
    }
    let keys = this.getParam('path', []);
    if (!Array.isArray(keys)) {
        keys = [keys];
    }

    const promises = keys
        .filter(k => typeof k === 'string')
        .map(key => [key, get(data, key)])
        .filter(val => val[1])
        .map(val => store.put(val[0], val[1]));

    Promise.all(promises)
        .then(() => feed.send(data))
        .catch((e) => feed.send(e));
}


