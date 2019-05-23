const fetch = require('fetch-with-proxy').default;

export default async function SPARQLQuery(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }

    const { query, endpoint } = data;
    if (!query) {
        throw new Error('No query given!');
    }
    if (!endpoint) {
        throw new Error('No sparql endpoint given !');
    }

    const encoded = encodeURIComponent(query);
    const requestUrl = `${endpoint}?query=${encoded}`;

    const options = {
        headers: {
            Accept: 'application/sparql-results+json',
        },
    };

    const response = await fetch(requestUrl, options);
    if (!response.ok) {
        throw new Error('Can not connect to the sparql endpoint !');
    }
    let responseData;
    try {
        responseData = await response.json();
    } catch (error) {
        throw new Error('The data is not JSON object !');
    }

    feed.write(responseData);
    return feed.end();
}
