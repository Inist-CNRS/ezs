import get from 'lodash.get';
import set from 'lodash.set';
import generate from 'nanoid/async/generate';
import nolookalikes from 'nanoid-dictionary/nolookalikes';
import { isURI, checkdigit } from './uri';

/**
 * Take `Object`, and compute & add a identifier
 *
 * @param {String} [scheme = uid] scheme prefix
 * @param {String} [path = uri] path containing the object Identifier
 * @returns {String}
 */
export default async function identify(data, feed) {
    const scheme = this.getParam('scheme', 'uid');
    const pathName = this.getParam('path', 'uri');
    const path = Array.isArray(pathName) ? pathName.shift() : pathName;
    const uri = get(data, path);
    if (this.isLast()) {
        return feed.close();
    }
    if (!isURI(uri)) {
        const identifier = await generate(nolookalikes, 8);
        const checksum = checkdigit(identifier);
        set(data, path, `${scheme}:/${identifier}${checksum}`);
    }
    return feed.send(data);
}
