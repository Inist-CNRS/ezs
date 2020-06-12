import { createStoreWithID } from './store';

/**
 * Takes all `Objects` from a store
 *
 * ```json
 * [
 *      'AEERRFFF',
 *      'DFERGGGV',
 * ]
 * ```
 *
 * Script:
 *
 * ```ini
 * [use]
 * plugin = analytics
 *
 * [buffers]
 * from = store/13455666/ddd
 *
 * ```
 *
 * Output:
 *
 * ```json
 *  [
 *           { year: 2000, dept: 54, bufferID: 'AEERRFFF' },
 *           { year: 2001, dept: 55, bufferID: 'AEERRFFF' },
 *           { annee: 2003, bufferID: 'DFERGGGV' },
 *  ]
 * ```
 *
 * @name buffers
 * @param {String} [from] the store id
 * @returns {Object}
 */
export default function buffers(data, feed) {
    if (this.isLast()) {
        feed.close();
        return;
    }
    const { ezs } = this;
    const location = this.getParam('location');
    const length = Number(this.getParam('length', -1));
    const statement = length === -1 ? 'transit' : 'truncate';
    const bufferID = String(data);
    const store = createStoreWithID(ezs, bufferID, location);
    store.stream()
        .pipe(ezs('extract', { path: 'value' }))
        .pipe(ezs(statement, { length }))
        .on('data', (item) => feed.write(item))
        .on('error', (e) => feed.stop(e))
        .on('end', () => {
            feed.end();
            store.close();
        });
}
