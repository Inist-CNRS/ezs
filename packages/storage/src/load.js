import store, { domainCheck } from './store';
import { isURI } from './uri';

/**
 * With a `String`, containing a URI throw all the documents that match
 *
 * @param {String} [domain=ezs] domain ID (same for all objects)
 * @returns {String}
 */
export default async function load(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    if (!isURI(data)) {
        return feed.end();
    }
    const domainName = this.getParam('domain', 'ezs');
    const domaines = await domainCheck(domainName);
    const promises = domaines.map((domain) => store(this.ezs, domain));
    return Promise.race(promises)
        .then((handle) => handle.get(data))
        .then((value) => feed.send(value))
        .catch(() => feed.end());
}
