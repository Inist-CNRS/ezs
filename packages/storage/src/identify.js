import generate from 'nanoid/async/generate';
import nolookalikes from 'nanoid-dictionary/nolookalikes';
import { isURI, checkdigit } from './uri';

/**
 * Take `Object`, and compute & add a URI
 *
 * @param {String} [batch = auto] batch ID (3 characters) (same for all objects)
 * @returns {String}
 */
export default async function identify(data, feed) {
    const batchName = this.getParam('batch', '');
    const batchNames = Array.isArray(batchName) ? batchName : [batchName];
    const batchid = String(batchNames.shift()).split('');
    if (this.isLast()) {
        return feed.close();
    }
    if (!this.prefix) {
        this.prefix = await generate(nolookalikes, 3);
    }
    if (!isURI(data.uri)) {
        const batch = this.prefix.split('').map((x, i) => (batchid[i] || x)).join('');
        const identifier = await generate(nolookalikes, 8);
        const checksum = checkdigit(batch + identifier);
        data.uri = `uid:/${batch}-${identifier}-${checksum}`;
    }
    return feed.send(data);
}
