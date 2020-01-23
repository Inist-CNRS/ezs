import get from 'lodash.get';
import store from './store';
import { isURI } from './uri';

/**
 * Take `Object`, to save it into a store and throw an URL
 *
 * @param {String} [path=uri] path containing the object Identifier
 * @param {String} [batch=ezs] batch ID (same for all objects)
 * @param {Boolean} [reset=false] if the store already exists, you will erase all previous content
 * @returns {Object}
 */
export default async function save(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const reset = Boolean(this.getParam('reset', false));
    const pathName = this.getParam('path', 'uri');
    const path = Array.isArray(pathName) ? pathName.shift() : pathName;
    const uri = get(data, path);
    const batchName = this.getParam('batch', 'ezs');
    const batch = Array.isArray(batchName) ? batchName.shift() : batchName;

    if (!isURI(uri)) {
        return feed.end();
    }
    if (this.isFirst() && reset === true) {
        const st = await store(this.ezs, batch);
        await st.reset(batch);
    }
    return store(this.ezs, batch)
        .then((handle) => handle.set(uri, data))
        .then(() => feed.send(uri))
        .catch((e) => feed.stop(e));
}
