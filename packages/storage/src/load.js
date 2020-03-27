import Store, { validKey } from './store';

/**
 * With a `String`, containing a URI throw all the documents that match
 *
 * @param {String} [domain=ezs] domain ID (that should contains the uri input)
 * @returns {String}
 */
export default async function load(data, feed) {
    const domain = this.getParam('domain', 'ezs');
    if (!this.store) {
        this.store = new Store(this.ezs, domain);
    }
    if (this.isLast()) {
        this.store.close();
        return feed.close();
    }
    if (!validKey(data)) {
        return feed.end();
    }

    const value = await this.store.get(data);
    return feed.send(value);
}
