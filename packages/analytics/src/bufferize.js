import set from 'lodash.set';
import { createStore } from '@ezs/store';

/**
 * Takes all `Objects` and bufferize them in a store
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
 * [bufferize]
 * path = bufferID
 *
 * ```
 *
 * Output:
 *
 * ```json
 *  [
 *           { year: 2000, dept: 54, bufferID: 'AEERRFFF' },
 *           { year: 2001, dept: 55, bufferID: 'AEERRFFF' },
 *           { year: 2003, dept: 54, bufferID: 'AEERRFFF' },
 *  ]
 * ```
 *
 * @name bufferize
 * @param {String} [path=bufferID] the path to insert the bufferID
 * @returns {Object}
 */
export default async function bufferize(data, feed) {
    const { ezs } = this;
    if (this.isFirst()) {
        const location = this.getParam('location');
        this.store = createStore(ezs, 'bufferize', location);
        this.store.reset();
    }
    if (this.isLast()) {
        return this.store.stream()
            .pipe(this.ezs('extract', { path: 'value' }))
            .on('data', (item) => feed.write(item))
            .on('error', (e) => feed.stop(e))
            .on('end', () => feed.close());
    }
    const path = this.getParam('path', 'bufferID');
    const key = this.getIndex().toString().padStart(20, '0');
    set(data, path, this.store.id());
    await this.store.put(key, data);
    return feed.end();
}
