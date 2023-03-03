import get from 'lodash.get';
import set from 'lodash.set';
import Store from './store';

/**
 * With a `String`, containing a URI throw all the documents that match
 *
 * @param {String} [path=uri] path containing the object Identifier
 * @param {String} [domain=ezs] domain ID (that should contains the uri input)
 * @param {String} [target] choose the key to set
 * @returns {String}
 */
export default async function load(data, feed) {
    const location = this.getParam('location');
    const pathName = this.getParam('path', 'uri');
    const path = Array.isArray(pathName) ? pathName.shift() : pathName;
    const uri = get(data, path);
    const domainName = this.getParam('domain', 'ezs');
    const domain = Array.isArray(domainName) ? domainName.shift() : domainName;
    const target = []
        .concat(this.getParam('target'))
        .filter(Boolean)
        .shift();

    if (!this.store) {
        this.store = new Store(this.ezs, domain, location);
    }
    if (this.isLast()) {
        this.store.close();
        return feed.close();
    }
    if (!uri) {
        console.warn(`WARNING: uri was empty, [load] item #${this.getIndex()} was ignored`);
        return feed.send(data);
    }
    try {
        const value = await this.store.get(uri);
        if (target) {
            set(data, target, value);
            return feed.send(data);
        }
        return feed.send(value);
    } catch(e) {
        console.warn(`WARNING: Fail to load uri (${uri}), item #${this.getIndex()} was ignored`, e);
        return feed.send(data);
    }
}
