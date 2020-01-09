import store from './store';
import { parseURI } from './uri';

/**
 * Take `Object`, to save it into a store and throw an URL
 *
 * @param {Boolean} [reset=false] if the store already exists, you will erase all previous content
 * @returns {Object}
 */
export default async function save(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const reset = Boolean(this.getParam('reset', false));
    const { batch } = parseURI(data.uri);
    if (!batch) {
        return feed.send(new Error(`Unable to parse URI (${data.uri})`));
    }
    if (this.isFirst() && reset === true) {
        const st = await store(this.ezs, batch);
        await st.reset(batch);
    }
    return store(this.ezs, batch)
        .then((handle) => handle.set(data.uri, data))
        .then(() => feed.send(data.uri))
        .catch(() => feed.end());
}
