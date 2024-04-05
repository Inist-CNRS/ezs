import postal from 'node-postal';
import { get, set, clone } from 'lodash';

const parse = (input) => ({
    id: input,
    value: postal.parser
        .parse_address(String(input).trim())
        .reduce((obj, cur) => ({ ...obj, [cur.component]: cur.value }), {}),
});

/**
 * Takes a field of object containing an address to return the same object except for the field containing the address.
 * This will contain the different fields found in the address.
 *
 * @name parseAddressWith
 * @param {String} [path] path to the chosen field
 * @returns {Object}
 */

export default function parseAddressWith(data, feed) {
    const paths = []
        .concat(this.getParam('path'))
        .filter(Boolean);
    if (this.isLast()) {
        return feed.close();
    }
    const tada = clone(data);
    paths.forEach((path) => {
        const value = get(data, path);
        if (Array.isArray(value)) {
            return set(tada, path, value.map(parse));
        }
        return set(tada, path, parse(value));
    });
    return feed.send(tada);
}
