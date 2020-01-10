import store from './store';
import { parseURI } from './uri';

/**
 * Take `String`, containing a URI throw all the documents that match
 *
 * @param {String} [store=repo] id of the local database
 * @returns {String}
 */
export default async function load(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const { batch } = parseURI(data);
    if (!batch) {
        return feed.send(new Error(`Unable to parse URI (${data.uri})`));
    }
    return store(this.ezs, batch)
        .then((handle) => handle.get(data))
        .then((value) => feed.send(value))
        .catch(() => feed.end());
}
