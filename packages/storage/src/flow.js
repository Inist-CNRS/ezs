import store from './store';

/**
 * Take an `Object` and replace it with all the objects of the same batch contained in the store.
 * Warning: order is not guaranteed
 *
 * @param {String} [batch=ezs] batch ID (same for all objects)
 * @param {Number} [length] limit the number of output objects
 * @returns {Object}
 */
export default async function flow(data, feed) {
    const length = Number(this.getParam('length'));
    const batchName = this.getParam('batch', 'ezs');
    const batch = Array.isArray(batchName) ? batchName.shift() : batchName;
    if (this.isLast()) {
        return feed.close();
    }
    return store(this.ezs, batch)
        .then((handle) => handle.all(length)
            .on('error', (e) => feed.stop(e))
            .on('data', (d) => feed.write(d))
            .on('end', () => feed.end()))
        .catch(() => feed.end());
}
