import get from 'lodash.get';
import store from './store';
import { isURI } from './uri';

/**
 * Take `Object`, to save it into a store and throw an URL
 *
 * @param {String} [path=uri] path containing the object Identifier
 * @param {String} [domain=ezs] domain ID (same for all objects)
 * @param {Boolean} [reset=false] if the store already exists, you will erase all previous content
 * @returns {Object}
 */
export default async function save(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const reset = Boolean(this.getParam('reset', false));
    const pathName = this.getParam('path', 'uri');
    const path = Array.isArray(pathName) ? pathName.shift() : pathName;
    const uri = get(data, path);
    const domainName = this.getParam('domain', 'ezs');
    const domain = Array.isArray(domainName) ? domainName.shift() : domainName;

    if (!isURI(uri)) {
        return feed.end();
    }
    if (this.isFirst() && reset === true) {
        const st = await store(this.ezs, domain);
        await st.reset(domain);
    }
    return store(this.ezs, domain)
        .then((handle) => handle.set(uri, data))
        .then(() => feed.send(uri))
        .catch((e) => feed.stop(e));
}
/*
 *    const domainName = this.getParam('domain', 'ezs');
    const domaines = await domainCheck(domainName);
    if (!isURI(uri)) {
        return feed.end();
    }
    if (this.isFirst() && reset === true) {
        const handles = domaines.map((domain) => store(this.ezs, domain));
        await Promise.all(handles)
            .then((hdl) => hdl.map((st) => st.reset()));
    }
    const handles = domaines.map((domain) => store(this.ezs, domain));
    const saves = Promise.all(handles)
        .then((hdl) => hdl.map((h) => h.set(uri, data)))
        .catch((e) => feed.stop(e));
    return Promise.all(saves)
        .then(() => feed.send(uri))
        .catch((e) => feed.stop(e));
        */
