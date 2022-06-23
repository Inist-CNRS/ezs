import debug from 'debug';
import { URL, URLSearchParams } from 'url';
import AbortController from 'node-abort-controller';
import get from 'lodash.get';
import parseHeaders from 'parse-headers';
import retry from 'async-retry';
import request from './request';



/**
 * Take `Object` as parameters of URL, throw each chunk from the result
 *
 *
 * Input:
 *
 * ```json
 * [{"q": "a"}]
 * ```
 *
 * Script:
 *
 * ```ini
 * [URLPagination]
 * url = https://api.search.net
 * path = total
 * ```
 *
 * Output:
 *
 * ```json
 * [
 *      {
 *          "q": "a",
 *          "total": 22
 *          "offset": 0,
 *          "pageNumber": 1,
 *          "totalPages", 3,
 *          "maxPages": 1000,
 *          "limit": 10
 *      },
 *      {
 *          "q": "a",
 *          "total": 22
 *          "offset": 10,
 *          "pageNumber": 2,
 *          "totalPages", 3,
 *          "maxPages": 1000,
 *          "limit": 10
 *      },
 *      {
 *          "q": "a",
 *          "total": 22
 *          "offset": 20,
 *          "pageNumber": 3,
 *          "totalPages", 3,
 *          "maxPages": 1000,
 *          "limit": 10
 *      }
 *  ]
 * ```
 *
 * #### Example with URLs
 *
 * Input:
 *
 * ```json
 * [
 *   "https://httpbin.org/get?a=a",
 *   "https://httpbin.org/get?a=b",
 *   "https://httpbin.org/get?a=c"
 * ]
 * ```
 *
 * Script:
 *
 * ```ini
 * [URLPagination]
 * path = .args
 * ```
 *
 * Output:
 *
 * ```json
 * [{"a": "a"}, {"a": "b"}, {"a": "c" }]
 * ```
 *
 * @name URLPagination
 * @param {String} [url] URL to fetch (by default input string is taken)
 * @param {String} [path=total] choose the path to find the number of result
 * @param {Number} [timeout=1000] Timeout in milliseconds
 * @param {Boolean} [noerror=false] Ignore all errors, the target field will remain undefined
 * @param {Number} [retries=5] The maximum amount of times to retry the connection
 * @returns {Object}
 */
export default async function URLPagination(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const url = this.getParam('url');
    const path = this.getParam('path', 'total');
    const limit = Number(this.getParam('limit', 10));
    const maxPages = Number(this.getParam('maxPages', 1000));
    const retries = Number(this.getParam('retries', 5));
    const noerror = Boolean(this.getParam('noerror', false));
    const timeout = Number(this.getParam('timeout')) || 1000;
    const headers = parseHeaders([]
        .concat(this.getParam('header'))
        .filter(Boolean)
        .join('\n'));
    const cURL = new URL(url || data);
    const controller = new AbortController();
    const parameters = {
        timeout,
        headers,
        signal: controller.signal,
    };
    const options = {
        retries,
    };
    cURL.search = new URLSearchParams(data);
    const onError = (e) => {
        controller.abort();
        if (noerror) {
            debug('ezs')(`Ignore item #${this.getIndex()} [URLPagination] <${e}>`);
            return feed.send(data);
        }
        debug('ezs')(`Break item #${this.getIndex()} [URLPagination] <${e}>`);
        return feed.send(e);
    };
    try {
        const response = await retry(request(cURL.href, parameters), options);
        const json = await response.json();
        const total = get(json, path);
        if (total === 0) {
            return onError(new Error('No result.'));
        }
        if (total === undefined) {
            return onError(new Error('Unexpected response.'));
        }
        let totalPages = Math.ceil(total / limit);
        if (totalPages > maxPages) {
            totalPages = maxPages;
        }

        for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
            feed.write({
                ...data,
                offset: ((pageNumber - 1) * limit),
                pageNumber,
                totalPages,
                maxPages,
                limit,
            });
        }
        feed.end();
    } catch (e) {
        onError(e);
    }
}
