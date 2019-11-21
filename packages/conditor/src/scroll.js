import URL from 'url';
import QueryString from 'qs';
import fetch from 'fetch-with-proxy';

const result = require('dotenv').config();

if (result.error) {
    throw result.error;
}
const token = process.env.CONDITOR_TOKEN;

/**
 * Use scroll to return all results from Conditor API
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
    console.log('urlStr', JSON.stringify(urlStr));
    let response = await fetch(urlStr);
    console.log('response', JSON.stringify(response, null, 2));
    const json = await response.json();
    // console.log('headers:', JSON.stringify(response.headers._headers, null, 2));
    // console.log('X-Total-Count', JSON.stringify(response.headers.get('X-Total-Count')), response.headers._headers['x-total-count']);
    // console.log('X-Result-Count', JSON.stringify(response.headers.get['X-Result-Count']), response.headers._headers['x-result-count']);
    // console.log('Scroll-Id', JSON.stringify(response.headers.get['Scroll-Id']), response.headers._headers['scroll-id']);
    if (response.headers.get['X-Total-Count'] === '0') {
        return feed.send(new Error('No result.'));
    }
    // TODO: treat an error
    if (response.headers.get['X-Total-Count'] === undefined) {
        return feed.send(new Error('Unexpected response.'));
    }
    this.resultsCount += Number(response.headers.get['X-Result-Count']);
    feed.write(json);

    while (this.resultsCount < Number(response.headers.get['X-Total-Count'])) {
        const scrollLocation = {
            protocol: 'https',
            host: 'api.conditor.fr',
            patname: `/v1/scroll/${response.headers.get['Scroll-Id']}`,
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
        console.log('scrollUrlStr', JSON.stringify(scrollUrlStr));
        // eslint-disable-next-line no-await-in-loop
        response = await fetch(scrollUrlStr);
        if (response.headers.get['X-Total-Count'] === 0) {
            return feed.send(new Error('No result.'));
        }
        // TODO: treat an error
        if (response.headers.get['X-Total-Count'] === undefined) {
            return feed.send(new Error('Unexpected response.'));
        }
        this.resultsCount += Number(response.headers.get['X-Result-Count']);
        feed.write(json);
    }

    return feed.end();
}
