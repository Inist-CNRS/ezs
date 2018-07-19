import get from 'lodash.get';
import set from 'lodash.set';
import { store } from './globals';

/**
 * Take `Object` and throw the same object but add stucked value
 *
 * @param {String} [path] path of field to extract
 * @returns {Object}
 */
export default function unstuck(data, feed) {
    if (this.isLast()) {
        return feed.send(data);
    }
    let keys = this.getParam('path', []);
    if (!Array.isArray(keys)) {
        keys = [keys];
    }

    keys = keys.filter(k => typeof k === 'string');

    const promises = keys.map(key => store.get(key).catch(error => { return error }) );

    Promise.all(promises)
        .then((values) => {
            values.forEach((val, idx) => {
                if ( ! (val instanceof Error)) {
                    set(data, keys[idx], val);
                }
            });
            feed.send(data)
        })
        .catch((e) => feed.send(e));
}


