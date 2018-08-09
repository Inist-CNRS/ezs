import URL from 'url';
import OBJ from 'dot-prop';
import fetch from 'omni-fetch';
import QueryString from 'qs';
import { newValue } from './utils';

/**
 * Take `Object` containing a query and outputs URLs to use with ISTEXScroll.
 * Optionally, you can put the query in the `query` parameter.
 *
 * @param {string} [source="query"] property to treat
 * @param {string} target   property used in the result
 * @param {string} query    ISTEX query
 * @param {string} [sid="ezs-istex"]  User-agent identifier
 * @param {number} maxPage  maximum number of pages to get from the API
 * @param {number} [size=2000]  size of each page of results
 * @param {string} [duration="30s"] maximum duration between two request to the API
 * @param {Array<string>} [field=["doi"]]   fields to output
 * @returns {Stream}
 */
function ISTEXSearch(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const source = this.getParam('source', 'query');
    const target = this.getParam('target');
    const query = this.getParam('query', OBJ.get(data, source, data));
    const sid = this.getParam('sid', 'ezs-istex');
    const maxPage = Number(this.getParam('maxPage'));
    const size = Number(this.getParam('size', 2000));
    const scroll = this.getParam('duration', '30s');
    const field = this.getParam('field', ['doi']);
    const fields = Array.isArray(field) ? field : [field];
    const output = `arkIstex,${fields.map(e => /\w+/.exec(e)[0]).join()}`;
    const location = {
        protocol: 'https:',
        host: 'api.istex.fr',
        pathname: '/document/',
    };
    const parameters = {
        q: query,
        scroll,
        output,
        size,
        sid,
    };
    const urlObj = {
        ...location,
        search: QueryString.stringify(parameters),
    };
    const urlStr = URL.format(urlObj);
    fetch(urlStr)
        .then(response => response.json())
        .then((json) => {
            if (json.total === 0) {
                return feed.send(new Error('No result.'));
            }
            if (json._error) {
                return feed.send(new Error(json._error));
            }
            if (json.total === undefined) {
                return feed.send(new Error('Unexpected response.'));
            }
            // first Page
            feed.write(newValue(json, target, data));
            const { scrollId } = json;
            const scrollUrl = URL.format({
                ...location,
                search: QueryString.stringify({
                    ...parameters,
                    scrollId,
                }),
            });
            // all other pages
            const pages = Array(Math.ceil(json.total / size) - 1).map(() => scrollUrl).fill(scrollUrl);
            if (maxPage) {
                pages.slice(0, maxPage - 1).forEach(pageURL => feed.write(newValue(pageURL, target, data)));
            } else {
                pages.forEach(pageURL => feed.write(newValue(pageURL, target, data)));
            }
            return feed.end();
        }).catch((err) => {
            err.url = urlStr;
            feed.send(err);
        });
}

export default {
    ISTEXSearch,
};
