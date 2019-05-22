export default function SPARQLDecodeQuery(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const { link } = data;
    if (!link) {
        throw new Error('No share link given !');
    }
    const reduced = link.substr(link.indexOf('#') + 1);
    const keysValues = reduced.split('&').map(elem => elem.split('='));
    const cleaned = keysValues.map(keyValue => keyValue.map(elem => decodeURIComponent(elem.replace(/\+/g, ' '))));
    const result = cleaned.reduce((acc, cur) => {
        const key = cur[0];
        const value = cur[1];
        acc[key] = value;
        return acc;
    }, {});

    const { query, endpoint } = result;
    if (!query || !endpoint) {
        throw new Error('Invalid link !');
    }
    feed.write(result);
    feed.end();
}
