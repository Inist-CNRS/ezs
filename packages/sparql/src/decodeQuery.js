export default function SPARQLDecodeQuery(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const { linkQuery } = data;
    if (!linkQuery) {
        throw new Error('No share link given !');
    }
    const reduced = linkQuery.substr(linkQuery.indexOf('#') + 1);
    const keyValuePairs = reduced.split('&').map(elem => elem.split('='));
    const cleaned = keyValuePairs.map(([key, value]) => [key, decodeURIComponent(value && value.replace(/\+/g, ' '))]);
    const result = cleaned.reduce((acc, [key, value]) => {
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
