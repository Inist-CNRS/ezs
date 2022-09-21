/* istanbul ignore file */
import debug from 'debug';
import { URL, URLSearchParams } from 'url';
import AbortController from 'node-abort-controller';
import get from 'lodash-get';
import retry from 'async-retry';
import fetch from 'fetch-with-proxy';
import writeTo from 'stream-write';
import each from 'async-each-series';

const request = (url, parameters) => async () => {
    const response = await fetch(url, parameters);
    if (!response.ok) {
        throw new Error(response.statusText);
    }
    return response;
};

const write = (output, notices) => new Promise((resolve, reject) => each(
    notices,
    (notice, next) => writeTo(output, notice, next),
    (err) => (err ? reject(err) : resolve(true)),
));

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
 * [WOSFetch]
 * token = SDQedaeaazedsqsd
 * ```
 *
 * Output:
 *
 * ```json
 * [{...}, {"a": "b"}, {"a": "c" }]
 * ```
 *
 * @name WOSFetch
 * @param {String} [url=https://wos-api.clarivate.com/api/wos] corhal api url
 * @param {String} [token] WOS API TOKEN
 * @param {Number} [timeout=1000] Timeout in milliseconds
 * @param {Number} [retries=5] The maximum amount of times to retry the connection
 * @returns {Object}
 */
export default async function WOSFetch(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const { ezs } = this;
    const url = String(this.getParam('url', 'https://wos-api.clarivate.com/api/wos'));
    const retries = Number(this.getParam('retries', 5));
    const timeout = Number(this.getParam('timeout')) || 1000;
    const cURL = new URL(url);
    data.count = 0;
    data.firstRecord = 1;
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
        debug('ezs')(`Break item #${this.getIndex()} [WOSFetch] <${e}>`);
        return feed.stop(e);
    };
    const loop = async (stream, arr, afterKeyToken) => {
        if (arr.length > 0) {
            await write(stream, arr);
        }
        if (afterKeyToken) {
            const href = `${url}/after/${afterKeyToken}`;
            const responseBis = await retry(request(href, parameters), options);
            const noticesBis = await responseBis.json();
            const afterKeyTokenBis = responseBis.headers.get('after-key-token');
            loop(stream, noticesBis, afterKeyTokenBis);
        } else {
            stream.end();
        }
    };
    try {
        const output = ezs.createStream(ezs.objectMode());
        const response = await retry(request(cURL.href, parameters), options);
        const notices = await response.json();
        const QueryID = get(notices, 'QueryResult.QueryID');
        await loop(output, notices, QueryID);
        await feed.flow(output);
    } catch (e) {
        onError(e);
    }
}
