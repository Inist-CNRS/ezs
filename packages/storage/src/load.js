import {
    validKey, encodeKey, decodeValue, lmdbEnv,
} from './store';

/**
 * With a `String`, containing a URI throw all the documents that match
 *
 * @param {String} [domain=ezs] domain ID (that should contains the uri input)
 * @returns {String}
 */
export default async function load(data, feed) {
    const domain = this.getParam('domain', 'ezs');
    if (this.isFirst()) {
        if (this.dbi) {
            this.dbi.close();
        }
        this.dbi = lmdbEnv(this.ezs).openDbi({
            name: domain,
            create: true,
        });
    }
    if (this.isLast()) {
        this.dbi.close();
        return feed.close();
    }
    if (!validKey(data)) {
        return feed.end();
    }
    const txn = lmdbEnv(this.ezs).beginTxn({ readOnly: true });
    const value = feed.send(decodeValue(txn.getString(this.dbi, encodeKey(data))));
    txn.commit();
    return feed.send(value);
}
