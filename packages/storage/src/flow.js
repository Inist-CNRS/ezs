import Store from './store';

/**
 * Take an `Object` and replace it with all the objects of the same domain contained in the store.
 * Warning: order is not guaranteed
 *
 * @param {String} [domain=ezs] domain ID (same for all objects)
 * @param {Number} [length] limit the number of output objects
 * @returns {Object}
 */
export default async function flow(data, feed) {
    const length = Number(this.getParam('length', -1));
    const statement = length === -1 ? 'transit' : 'truncate';
    const domainName = this.getParam('domain', 'ezs');
    const domain = Array.isArray(domainName) ? domainName.shift() : domainName;
    if (!this.store) {
        this.store = new Store(this.ezs, domain);
    }
    if (this.isLast()) {
        this.store.close();
        return feed.close();
    }

    return this.store.stream()
        .pipe(this.ezs('extract', { path: 'value' }))
        .pipe(this.ezs(statement, { length }))
        .on('data', (item) => feed.write(item))
        .on('error', (e) => feed.stop(e))
        .on('end', () => feed.end());
}
