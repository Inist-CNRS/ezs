import { hostname } from 'os';
import get from 'lodash.get';
import Store, { validKey } from './store';

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
    const protocol = this.getParam('protocol', 'http:');
    const host = this.getParam('host', `${hostname()}:${ezs.settings.port}`);
    const reset = Boolean(this.getParam('reset', false));
    const pathName = this.getParam('path', 'uri');
    const path = Array.isArray(pathName) ? pathName.shift() : pathName;
    const uri = get(data, path);
    const domainName = this.getParam('domain', 'ezs');
    const domain = Array.isArray(domainName) ? domainName.shift() : domainName;
    if (!this.store) {
        this.store = new Store(this.ezs, domain);
    }
    if (this.isFirst() && reset === true) {
        this.store.reset();
    }
    if (this.isLast()) {
        this.store.close();
        return feed.close();
    }
    if (!validKey(uri)) {
        return feed.end();
    }
    await this.store.put(uri, data);

    if (protocol && host) {
        return feed.send(`${protocol}//${host}/${uri}`);
    }
    return feed.send(uri);
}
