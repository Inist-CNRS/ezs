import get from 'lodash.get';
import Store from './store';

/**
 * Take `Object`, to save it into a store and throw an URL
 *
 * @param {String} [path=uri] path containing the object Identifier
 * @param {String} [domain=ezs] domain ID (same for all objects)
 * @param {Boolean} [reset=false] if the store already exists, you will erase all previous content
 * @returns {Object}
 */
export default async function save(data, feed) {
    const { ezs } = this;
    const location = this.getParam('location');
    const reset = Boolean(this.getParam('reset', false));
    const pathName = this.getParam('path', 'uri');
    const path = Array.isArray(pathName) ? pathName.shift() : pathName;
    const uri = get(data, path);
    const domainName = this.getParam('domain', 'ezs');
    const domain = Array.isArray(domainName) ? domainName.shift() : domainName;
    if (!this.store) {
        this.store = new Store(ezs, domain, location);
    }
    if (this.isFirst() && reset === true) {
        this.store.reset();
    }
    if (this.isLast()) {
        this.store.close();
        return feed.close();
    }
    if (!uri) {
        console.warn(`WARNING: uri was empty, [save] item #${this.getIndex()} was ignored`);
        return feed.send(data);
    }
    try {
        await this.store.put(uri, data);
        return feed.send(data);
    } catch(e) {
        console.warn(`WARNING: Fail to save uri (${uri}), item #${this.getIndex()} was ignored`, e);
        return feed.send(data);
    }
}
