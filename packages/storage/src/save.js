import { get } from 'lodash';
import debug from 'debug';
import store from './store';

/**
 * Take `Object`, to save it into a store and throw an URL
 *
 * @param {String} [path=uri] path containing the object Identifier
 * @param {String} [domain=ezs] domain ID (same for all objects)
 * @param {Boolean} [reset=false] if the store already exists, you will erase all previous content
 * @param {Boolean} [score=false] if the object has already been saved, the current object will replace it if its score is higher
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
    const score = this.getParam('score', false);
    try {
        if (!this.store) {
            this.store = await store(ezs, domain, location);
        }
        if (this.isLast()) {
            await this.store.close();
            return feed.close();
        }

        if (this.isFirst() && reset === true) {
            await this.store.reset();
        }
        if (!uri) {
            debug('ezs:warn')(`uri was empty, [save] item #${this.getIndex()} was ignored`);
            return feed.send(data);
        }
        await this.store.put(uri, data, score);
        return feed.send(data);
    } catch(e) {
        return feed.stop(e);
    }
}
