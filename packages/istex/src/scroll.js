/* eslint-disable no-await-in-loop */
import URL from 'url';
import QueryString from 'qs';
import fetch from 'fetch-with-proxy';

/**
 * Take an object containing a query string field and output records from the
 * ISTEX API. Every output record is merged with the input object.
 *
 * @example
 * from([{ query: 'this is a test' }])
 *   .pipe(ezs('ISTEXScroll', {
 *       maxPage: 2,
 *       size: 1,
 *       sid: 'test',
 *   }))
 * @name ISTEXScroll
 * @param {string} [query=input]          ISTEX query
 * @param {string} [sid="ezs-istex"]    User-agent identifier
 * @param {number} maxPage              Maximum number of pages to get
 * @param {number} [size=2000]          size of each page of results
 * @param {string} [duration="5m"]     maximum duration between two requests
 * @param {Array<string>} [field=["doi"]]   fields to get
 * @returns {Array<Object>}
 */
async function ISTEXScroll(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const query = this.getParam('query') || data.query || '';
    const sid = this.getParam('sid', 'ezs-istex');
    const maxPage = Number(this.getParam('maxPage'));
    const size = Number(this.getParam('size', 2000));
    const scroll = this.getParam('duration', '5m');
    const field = this.getParam('field', ['doi']);
    const fields = Array.isArray(field) ? field : [field];
    const output = `arkIstex,${fields.map((e) => /\w+|\*/.exec(e)[0]).join()}`;
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
    const response = await fetch(urlStr);
    let json = await response.json();
    if (json.total === 0) {
        return feed.send(new Error('No result.'));
    }
    if (json._error) {
        return feed.send(new Error(json._error));
    }
    if (json.total === undefined) {
        return feed.send(new Error('Unexpected response.'));
    }
    let nbPages = Math.ceil(json.total / size);
    if (nbPages > maxPage) {
        nbPages = maxPage;
    }
    if (json.noMoreScrollResults) {
        nbPages = 1;
    }
    for (let i = 0; i < nbPages; i += 1) {
        const { nextScrollURI } = json;
        json = { ...json, ...data };
        feed.write(json);

        if (json.noMoreScrollResults) {
            break;
        }
        const res = await fetch(nextScrollURI);
        json = await res.json();
    }

    feed.end();
}

export default {
    ISTEXScroll,
};
