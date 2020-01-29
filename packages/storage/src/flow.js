import store from './store';

/**
 * Take an `Object` and replace it with all the objects of the same domain contained in the store.
 * Warning: order is not guaranteed
 *
 * @param {String} [domain=ezs] domain ID (same for all objects)
 * @param {Number} [length] limit the number of output objects
 * @returns {Object}
 */
export default async function flow(data, feed) {
    const length = Number(this.getParam('length'));
    const domainName = this.getParam('domain', 'ezs');
    const domain = Array.isArray(domainName) ? domainName.shift() : domainName;
    if (this.isLast()) {
        return feed.close();
    }
    return store(this.ezs, domain)
        .then((handle) => handle.all(length)
            .on('error', (e) => feed.stop(e))
            .on('data', (d) => feed.write(d))
            .on('end', () => feed.end()))
        .catch(() => feed.end());
}
