import { get, set } from 'lodash';
import debug from 'debug';
import store from './store';

/**
 * With a `String`, containing a URI throw all the documents that match
 *
 * @param {String} [path=uri] path containing the object Identifier
 * @param {String} [domain=ezs] domain ID (that should contains the uri input)
 * @param {String} [target] choose the key to set
 * @returns {String}
 */
export default async function load(data, feed) {
    const { ezs } = this;
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
    try {
        if (!this.store) {
            this.store = await store(this.ezs, domain, location);
        }
        if (this.isLast()) {
            await this.store.close();
            return feed.close();
        }
        if (!uri) {
            debug('ezs:warn')(`uri was empty, [load] item #${this.getIndex()} was ignored`);
            return feed.send(data);
        }
        const value = await this.store.get(uri);
        if (target) {
            set(data, target, value);
            return feed.send(data);
        }
        return feed.send(value);
    } catch(e) {
        if (e.code === 'ENOENT') {
            debug('ezs:warn')(`uri not found (${uri}), item #${this.getIndex()} was ignored`, ezs.serializeError(e));
            if (target) {
                set(data, target, undefined);
                return feed.send(data);
            }
            return feed.end();
        }
        return feed.stop(e);
    }
}
