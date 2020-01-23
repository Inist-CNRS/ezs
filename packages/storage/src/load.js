import store from './store';
import { isURI } from './uri';

/**
 * With a `String`, containing a URI throw all the documents that match
 *
 * @param {String} [batch=ezs] batch ID (same for all objects)
 * @returns {String}
 */
export default async function load(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const batchName = this.getParam('batch', 'ezs');
    const batch = Array.isArray(batchName) ? batchName.shift() : batchName;

    if (!isURI(data)) {
        return feed.end();
    }
    return store(this.ezs, batch)
        .then((handle) => handle.get(data))
        .then((value) => feed.send(value))
        .catch(() => feed.end());
}
