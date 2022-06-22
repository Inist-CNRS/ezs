/* istanbul ignore file */
import debug from 'debug';
import { URL, URLSearchParams } from 'url';
import AbortController from 'node-abort-controller';
import retry from 'async-retry';
import fetch from 'fetch-with-proxy';

const request = (url, parameters) => async () => {
    const response = await fetch(url, parameters);
    if (!response.ok) {
        throw new Error(response.statusText);
    }
    return response;
};

/**
 * Take `String` as URL, throw each chunk from the result
 *
 *
 * Input:
 *
 * ```json
 * [
 *   { q: "toto" },
 * ]
 * ```
 *
 * Script:
 *
 * ```ini
 * [CORHALFetch]
 * url = https://corhal-api.inist.fr
 * ```
 *
 * Output:
 *
 * ```json
 * [{...}, {"a": "b"}, {"a": "c" }]
 * ```
 *
 * @name CORHALFetch
 * @param {String} [url] corhal api url
 * @param {Number} [timeout=1000] Timeout in milliseconds
 * @param {Number} [retries=5] The maximum amount of times to retry the connection
 * @returns {Object}
 */
export default async function CORHALFetch(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const url = String(this.getParam('url', 'https://corhal-api.inist.fr'));
    const retries = Number(this.getParam('retries', 5));
    const timeout = Number(this.getParam('timeout')) || 1000;
    const cURL = new URL(`${url}/mergedDocuments`);
    cURL.search = new URLSearchParams(data);
    const controller = new AbortController();
    const parameters = {
        timeout,
        signal: controller.signal,
    };
    const options = {
        retries,
    };
    const onError = (e) => {
        controller.abort();
        debug('ezs')(`Break item #${this.getIndex()} [CORHALFetch] <${e}>`);
        return feed.send(e);
    };
    try {
        const response = await retry(request(cURL.href, parameters), options);
        const totalCount = Number(response.headers.get('x-total-count'));
        const max = Math.max(10_000_000, totalCount);
        let notices = await response.json();
        let resultCount = notices.length;
        let afterKeyToken = response.headers.get('after-key-token');
        while (afterKeyToken && resultCount < max) {
            notices.forEach((notice) => feed.write(notice));
            const href = `${url}/after/${afterKeyToken}`;
            const responseBis = await retry(request(href, parameters), options);
            notices = await responseBis.json();
            resultCount += notices.length;
            afterKeyToken = responseBis.headers.get('after-key-token');
        }
        feed.end();
    } catch (e) {
        onError(e);
    }
}
