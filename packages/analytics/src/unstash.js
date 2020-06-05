import { createStoreWithID } from './store';

/**
 * Takes all `Objects` from a store
 *
 * ```json
 * [
 *           { a: 1 },
 *           { a: 2 },
 *           { a: 3 },
 * ]
 * ```
 *
 * Script:
 *
 * ```ini
 * [use]
 * plugin = analytics
 *
 * [unstash]
 * from = store/13455666/ddd
 *
 * ```
 *
 * Output:
 *
 * ```json
 *  [
 *           { year: 2000, dept: 54, storeID: 'AEERRFFF' },
 *           { year: 2001, dept: 55, storeID: 'AEERRFFF' },
 *           { year: 2003, dept: 54, storeID: 'AEERRFFF' },
 *  ]
 * ```
 *
 * @name unstash
 * @param {String} [from] the store id
 * @returns {Object}
 */
export default async function unstash(data, feed) {
    const location = this.getParam('location');
    const length = Number(this.getParam('length', -1));
    const statement = length === -1 ? 'transit' : 'truncate';
    const from = this.getParam('from');
    const storeID = Array.isArray(from) ? from.shift() : from;
    if (!this.store) {
        this.store = createStoreWithID(this.ezs, storeID, location);
    }
    if (this.isLast()) {
        return this.store.stream()
            .pipe(this.ezs('extract', { path: 'value' }))
            .pipe(this.ezs(statement, { length }))
            .on('data', (item) => feed.write(item))
            .on('error', (e) => feed.stop(e))
            .on('end', () => {
                feed.close();
                this.store.close();
            });
    }
    return feed.end();
}
