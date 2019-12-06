import URL from 'url';
import QueryString from 'qs';
import fetch from 'fetch-with-proxy';

const result = require('dotenv').config();

if (result.error) {
    throw result.error;
}
const token = process.env.CONDITOR_TOKEN;

// Because response.headers.get() does not work well
// eslint-disable-next-line no-underscore-dangle
const getHeader = (header) => (response) => response.headers._headers[header.toLowerCase()];
const getTotalFromHeader = getHeader('X-Total-Count');
const getResultCountFromHeader = getHeader('X-Result-Count');
const getScrollIdFromHeader = getHeader('Scroll-Id');

/**
 * Use scroll to return all results from Conditor API.
 *
 * > :warning: you have to put a valid token into a `.env` file, under
 * > `CONDITOR_TOKEN` variable:
 *
 * ```
 * CONDITOR_TOKEN=eyJhbG...
 * ```
 *
 * @export
 * @name conditorScroll
 * @param {string} [q=""]           query
 * @param {string} [scroll="5m"]    duration of the scroll
 * @param {number} [page_size=10]   size of the pages
 * @param {string} includes         fields to get in the response
 * @param {string} excludes         fields to exlude from the response
 * @param {string} [sid="ezs-conditor"]    User-agent identifier
 * @returns {object[]}
 */
export default async function conditorScroll(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    if (this.isFirst()) {
        this.resultsCount = 0;
    }
    const q = this.getParam('q') || data.query;
    const scroll = this.getParam('scroll') || data.scroll || '5m';
    const pageSize = this.getParam('page_size') || data.page_size || 10;
    const includes = this.getParam('includes');
    const excludes = this.getParam('excludes');
    const sid = this.getParam('sid') || data.sid || 'ezs-conditor';

    const location = {
        protocol: 'https:',
        host: 'api.conditor.fr',
        pathname: '/v1/records',
    };
    const parameters = {
        q,
        scroll,
        includes,
        excludes,
        page_size: pageSize,
        access_token: token,
        sid,
    };
    const urlObj = {
        ...location,
        search: QueryString.stringify(parameters),
    };
    const urlStr = URL.format(urlObj);
    let response = await fetch(urlStr);
    let json = await response.json();
    if (getTotalFromHeader(response) === '0') {
        return feed.send(new Error('No result.'));
    }
    if (getTotalFromHeader(response) === undefined) {
        return feed.send(new Error('Unexpected response.'));
    }
    this.resultsCount += Number(getResultCountFromHeader(response));
    feed.write(json);

    while (this.resultsCount < Number(getTotalFromHeader(response))) {
        const scrollLocation = {
            protocol: 'https',
            host: 'api.conditor.fr',
            patname: `/v1/scroll/${getScrollIdFromHeader(response)}`,
        };
        const scrollParameters = {
            access_token: token,
            sid,
        };
        const scrollUrlObj = {
            ...scrollLocation,
            search: QueryString.stringify(scrollParameters),
        };
        const scrollUrlStr = URL.format(scrollUrlObj);
        // eslint-disable-next-line no-await-in-loop
        response = await fetch(scrollUrlStr);
        if (Number(getTotalFromHeader(response)) === 0) {
            return feed.send(new Error('No result.'));
        }
        if (getTotalFromHeader(response) === undefined) {
            return feed.send(new Error('Unexpected response.'));
        }
        this.resultsCount += Number(getResultCountFromHeader(response));
        // eslint-disable-next-line no-await-in-loop
        json = await response.json();
        feed.write(json);
    }

    return feed.end();
}
