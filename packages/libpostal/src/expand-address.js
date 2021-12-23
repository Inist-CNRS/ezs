import postal from '@cymen/node-postal';

const expand = (input) => ({
    id: input,
    value: postal.expand.expand_address(String(input).trim()),
});

export default function parseAddress(data, feed) {
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
