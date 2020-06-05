import set from 'lodash.set';
import { createStore } from './store';

/**
 * Takes all `Objects` and stash them in a store
 *
 * ```json
 * [
 *           { year: 2000, dept: 54 },
 *           { year: 2001, dept: 55 },
 *           { year: 2003, dept: 54 },
 * ]
 * ```
 *
 * Script:
 *
 * ```ini
 * [use]
 * plugin = analytics
 *
 * [stash]
 * path = storeID
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
 * @name stash
 * @param {String} [path=storeID] the path to insert the storeID
 * @returns {Object}
 */
export default async function stash(data, feed) {
    const { ezs } = this;
    if (this.isFirst()) {
        const location = this.getParam('location');
        this.store = createStore(ezs, 'stash', location);
        this.store.reset();
    }
    if (this.isLast()) {
        return this.store.stream()
            .pipe(this.ezs('extract', { path: 'value' }))
            .on('data', (item) => feed.write(item))
            .on('error', (e) => feed.stop(e))
            .on('end', () => {
                feed.close();
                this.store.close();
            });
    }
    const path = this.getParam('path', 'storeID');
    const key = this.getIndex().toString().padStart(20, '0');
    set(data, path, this.store.id());
    await this.store.put(key, data);
    return feed.end();
}
