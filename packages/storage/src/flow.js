import lmdb from 'node-lmdb';
import { encodeKey, decodeValue, lmdbEnv } from './store';

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
    const domainName = this.getParam('domain', 'ezs');
    const domain = Array.isArray(domainName) ? domainName.shift() : domainName;
    if (this.isFirst()) {
        this.dbi = lmdbEnv(this.ezs).openDbi({
            name: domain,
        });
    }
    if (this.isLast()) {
        this.dbi.close();
        return feed.close();
    }
    const txn = lmdbEnv(this.ezs).beginTxn({ readOnly: true });
    const cursor = new lmdb.Cursor(txn, this.dbi);
    let counter = 0;
    for (let found = cursor.goToFirst();
        (found !== null && (counter < length || length < 0));
        found = cursor.goToNext()) {
        counter += 1;
        const value = txn.getString(this.dbi, encodeKey(found));
        feed.write(decodeValue(value));
    }
    txn.commit();
    return feed.end();
}
