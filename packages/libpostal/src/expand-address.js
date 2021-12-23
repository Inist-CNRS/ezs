import postal from '@cymen/node-postal';

const expand = (input) => ({
    id: input,
    value: postal.expand.expand_address(String(input).trim()),
});

/**
 * Takes a string containing an address to return an object.
 * This will contain a standardized version of the address.
 *
 * @name expandAddress
 * @returns {Object}
 */
export default function expandAddress(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    if (Array.isArray(data)) {
        return feed.send(data.map(expand));
    }
    if (typeof data === 'string') {
        return feed.send(expand(data));
    }
    return feed.send(data);
}
