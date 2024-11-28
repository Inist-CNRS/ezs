/* istanbul ignore file */
import debug from 'debug';
import { URL, URLSearchParams } from 'url';
import AbortController from 'node-abort-controller';
import retry from 'async-retry';
import fetch from 'fetch-with-proxy';
import writeTo from 'stream-write';
import each from 'async-each-series';

const request = (url, parameters) => async () => {
    const response = await fetch(url, parameters);
    if (!response.ok) {
        const err = new Error(response.statusText);
        err.body = await response.json();
        throw err;
    }
    return response;
};
const write = (output, notices) => new Promise((resolve, reject) => each(
    notices,
    (notice, next) => writeTo(output, notice, next),
    (err) => (err ? reject(err) : resolve(true)),
));

/**
 * Take `Object` with OpenAlx API parametrs, throw each chunk from the result
 *
 *
 * Input:
 *
 * ```json
 * [
 *   { filter: "authorships.author.id:a5000387389" },
 * ]
 * ```
 *
 * Script:
 *
 * ```ini
 * [OAFetch]
 *
 * Output:
 *
 * ```json
 * [{...}, {"a": "b"}, {"a": "c" }]
 * ```
 *
 * @name OAFetch
 * @param {Number} [timeout=1000] Timeout in milliseconds
 * @param {Number} [retries=5] The maximum amount of times to retry the connection
 * @returns {Object}
 */
export default async function OAFetch(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const { ezs } = this;
    const url = String(this.getParam('url', 'https://api.openalex.org'));
    const retries = Number(this.getParam('retries', 5));
    const timeout = Number(this.getParam('timeout')) || 1000;
    const queryparams = new URLSearchParams({
        'per-page': 20,
        ...data,
        cursor: '*',
    });
    const stringURL = `${url}/works?${queryparams}`;
    const cURL = new URL(stringURL);
    const controller = new AbortController();
    const parameters = {
        timeout,
        signal: controller.signal,
        method: 'GET',
    };
    const options = {
        retries,
    };
    const onError = (e) => {
        controller.abort();
        debug('ezs:warn')(`Break item #${this.getIndex()} [OAFetch]`, ezs.serializeError(e));
        return feed.stop(e);
    };
    const loop = async (stream, arr, afterKeyToken) => {
        if (Array.isArray(arr) && arr.length > 0) {
            await write(stream, arr);
        }
        if (afterKeyToken) {
            queryparams.set('cursor', afterKeyToken);
            const stringURLBis = `${url}/works?${queryparams}`;
            const cURLBis = new URL(stringURLBis);
            const parametersBis = {
                timeout,
                signal: controller.signal,
                method: 'GET',
            };
            try {
                const responseBis = await retry(request(cURLBis.href, parametersBis), options);
                const { results: resultsBis, meta: metaBis } = await responseBis.json();
                loop(stream, resultsBis, metaBis?.next_cursor);
            } catch (e) {
                debug('ezs:error')(`Error with ${stringURLBis}`, ezs.serializeError(e));
                stream.end();
            }
        } else {
            stream.end();
        }
    };
    try {
        const output = ezs.createStream(ezs.objectMode());
        const response = await retry(request(cURL.href, parameters), options);
        const { results, meta } = await response.json();
        await loop(output, results, meta?.next_cursor);
        await feed.flow(output);
    } catch (e) {
        onError(e);
    }
}
