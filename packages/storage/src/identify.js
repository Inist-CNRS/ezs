import get from 'lodash.get';
import set from 'lodash.set';
import { customAlphabet } from 'nanoid/async';
import nolookalikes from 'nanoid-dictionary/nolookalikes';

export const validKey = (input) =>
    (Boolean(input) && typeof input === 'string' && input.search(/\w+:(\/?\/?)[^\s]+/g) >= 0);

const generate = customAlphabet(nolookalikes, 8);

//
// JS implentation of NCDA
// see http://search.cpan.org/~jak/Noid/noid#NOID_CHECK_DIGIT_ALGORITHM
//
export function ncda(input, alphabet = []) {
    if (!input || typeof input !== 'string') {
        return '';
    }
    const R = alphabet.length;
    const chr = input.split('');
    const ord = [];
    const pos = [];
    chr.forEach((c, i) => {
        const z = alphabet.indexOf(c);
        ord.push(z > 0 ? z : 0);
        pos.push(i + 1);
    });
    let sum = 0;
    pos.forEach((p, i) => {
        sum += p * ord[i];
    });
    const x = sum % R;
    return alphabet[x] || '';
}

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
    if (!validKey(uri)) {
        const identifier = await generate();
        const checksum = ncda(identifier, nolookalikes);
        set(data, path, `${scheme}:/${identifier}${checksum}`);
    }
    return feed.send(data);
}
