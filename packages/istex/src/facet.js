import URL from 'url';
import QueryString from 'qs';
import fetch from 'fetch-with-proxy';

/**
 * Take an object containing a query string field, a facet, and output
 * aggregations from the ISTEX API.
 *
 * @example
 * from([{ query: 'ezs', facet: 'corpusName' }])
 *   .pipe(ezs('ISTEXFacet', { sid: 'test', }))
 * @name ISTEXFacet
 * @param {string} [query="*"]          ISTEX query
 * @param {string} [facet="corpusName"]   ISTEX facet
 * @param {string} [sid="ezs-istex"]    User-agent identifier
 * @returns {Array<Object>}
 */
async function ISTEXFacet(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const query = this.getParam('query', data.query || '*');
    const facet = this.getParam('facet', data.facet || 'corpusName');
    const sid = this.getParam('sid', 'ezs-istex');
    const size = 0;
    const location = {
        protocol: 'https:',
        host: 'api.istex.fr',
        pathname: '/document/',
    };
    const parameters = {
        q: query,
        facet,
        size,
        sid,
    };
    const urlObj = {
        ...location,
        search: QueryString.stringify(parameters),
    };
    const urlStr = URL.format(urlObj);
    const response = await fetch(urlStr);
    const json = await response.json();
    if (json.total === 0) {
        return feed.send(new Error('No result.'));
    }
    if (json._error) {
        return feed.send(new Error(json._error));
    }
    if (json.total === undefined) {
        return feed.send(new Error('Unexpected response.'));
    }
    feed.write(json);
    feed.end();
}

export default {
    ISTEXFacet,
};
