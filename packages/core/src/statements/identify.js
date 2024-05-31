import  { createHash } from 'crypto';
import _ from 'lodash';
import generate from 'nanoid/async/generate';
import nolookalikes from 'nanoid-dictionary/nolookalikes';

export const validKey = (input) =>
    Boolean(input) &&
    typeof input === 'string' &&
    input.search(/^[a-z]+:(\/?\/?)[^\s]+$/g) === 0;

const sha = (input) => Promise.resolve(createHash('sha256').update(JSON.stringify(input)).digest('hex'));

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

export const checksum = (input) => ncda(input, nolookalikes);

/**
 * Take `Object`, and compute & add an identifier
 *
 * @param {String} [scheme = uid] scheme to use (uid or sha)
 * @param {String} [path = uri] path containing the object Identifier
 * @returns {String}
 */
export default async function identify(data, feed) {
    const scheme = this.getParam('scheme', 'uid');
    const pathName = this.getParam('path', 'uri');
    const path = Array.isArray(pathName) ? pathName.shift() : pathName;
    const uri = _.get(data, path);
    if (this.isLast()) {
        return feed.close();
    }
    try {
        if (!validKey(uri)) {
            let identifier;
            if (scheme === 'uid') {
                identifier = await generate(nolookalikes, 8);
            } else if (scheme === 'sha') {
                identifier = await sha(data);
            }
            if (identifier) {
                const digit = checksum(identifier);
                _.set(data, path, `${scheme}:/${identifier}${digit}`);
            }
        }
    }
    catch (e) {
        return feed.stop(e);
    }
    return feed.send(data);
}
