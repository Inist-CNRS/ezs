import URL from 'url';
import QueryString from 'qs';
import fetch from 'fetch-with-proxy';
import { head, pathOr, pipe, toLower } from 'ramda';
import ProgressBar from 'progress';

// Because response.headers.get() does not work well
const getHeader = (header) =>
    pipe(pathOr([], ['headers', '_headers', toLower(header)]), head);
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
 * @example <caption>Input</caption>
 * {
 *   "q": "Test",
 *   "page_size": 1,
 *   "max_page": 1,
 *   "includes": "sourceUid"
 * }
 *
 * @example <caption>Output</caption>
 * [[
 *     {
 *         "sourceUid": "hal$hal-01412764",
 *         "_score": 5.634469,
 *         "_sort": [
 *             0
 *         ]
 *     }
 * ]]
 *
 * @export
 * @name conditorScroll
 * @param {string}  [q=""]             query
 * @param {string}  [scroll="5m"]      duration of the scroll
 * @param {number}  [page_size=1000]   size of the pages
 * @param {number}  [max_page=1000000] maximum number of pages
 * @param {string}  includes           fields to get in the response
 * @param {string}  excludes           fields to exclude from the response
 * @param {string}  [sid="ezs-conditor"]    User-agent identifier
 * @param {boolean} [progress=false]   display a progress bar in stderr
 * @returns {object[]}
 */
export default async function conditorScroll(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    if (this.isFirst()) {
        // Tests mock fetch, so that there is no need for CONDITOR_TOKEN
        if (process.env.NODE_ENV !== 'test') {
            // eslint-disable-next-line global-require
            const result = require('dotenv').config();

            if (result.error) {
                throw result.error;
            }
        }

        this.token = process.env.CONDITOR_TOKEN;

        this.resultsCount = 0;
    }
    const q = this.getParam('q') || data.query;
    const scroll = this.getParam('scroll') || data.scroll || '5m';
    const pageSize = this.getParam('page_size') || data.page_size || 1000;
    const maxPage = this.getParam('max_page') || data.max_page || 1000000;
    const includes = this.getParam('includes');
    const excludes = this.getParam('excludes');
    const sid = this.getParam('sid') || data.sid || 'ezs-conditor';
    const progress = this.getParam('progress') || data.progress || false;

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
        access_token: this.token,
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
        return feed.send(new Error('Unexpected first response.'));
    }
    this.page = 1;
    this.resultsCount += Number(getResultCountFromHeader(response));
    feed.write(json);

    const total = Number(getTotalFromHeader(response));
    let bar;
    if (progress) {
        bar = new ProgressBar('[:bar] :current / :total :elapseds <- :etas', {
            total,
        });
        bar.tick(this.resultsCount);
    }

    while (this.resultsCount < total && this.page < maxPage) {
        const scrollLocation = {
            protocol: 'https',
            host: 'api.conditor.fr',
            pathname: `/v1/scroll/${getScrollIdFromHeader(response)}`,
        };
        const scrollParameters = {
            access_token: this.token,
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
        this.page += 1;
        const resultCount = Number(getResultCountFromHeader(response));
        if (progress) {
            bar.tick(resultCount);
        }
        this.resultsCount += resultCount;
        // eslint-disable-next-line no-await-in-loop
        json = await response.json();
        feed.write(json);
    }

    return feed.end();
}
