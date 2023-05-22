import store from './store';

/**
 * Take an `Object` and replace it with all the objects of the same domain contained in the store.
 *
 * > Warning: order is not guaranteed
 *
 * @param {String} [domain=ezs] domain ID (same for all objects)
 * @param {String} [clean=false] clean all stored object after cast them
 * @returns {Object}
 */
export default async function cast(data, feed) {
    const location = this.getParam('location');
    const clean = Boolean(this.getParam('clean', false));
    const func = clean ? 'empty' : 'cast';
    const domainName = this.getParam('domain', 'ezs');
    const domain = Array.isArray(domainName) ? domainName.shift() : domainName;
    if (this.isLast()) {
        return feed.close();
    }
    try {
        if (!this.store) {
            this.store = await store(this.ezs, domain, location);
        }
        const stream = await this.store[func]();
        return feed.flow(stream.pipe(this.ezs('extract', { path: 'value' })));
    }
    catch (e) {
        return feed.stop(e);
    }
}
