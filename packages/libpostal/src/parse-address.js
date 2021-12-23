import postal from '@cymen/node-postal';

const parse = (input) => ({
    id: input,
    value: postal.parser
        .parse_address(String(input).trim())
        .reduce((obj, cur) => ({ ...obj, [cur.component]: cur.value }), {}),
});

export default function parseAddress(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    if (Array.isArray(data)) {
        return feed.send(data.map(parse));
    }
    if (typeof data === 'string') {
        return feed.send(parse(data));
    }
    return feed.send(data);
}
