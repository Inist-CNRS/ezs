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
    const { ezs } = this;
    const url = String(this.getParam('url', 'https://corhal-api.inist.fr'));
    const retries = Number(this.getParam('retries', 5));
    const timeout = Number(this.getParam('timeout')) || 1000;
    const cURL = new URL(`${url}/mergedDocuments/_search`);
    const controller = new AbortController();
    const parameters = {
        timeout,
        signal: controller.signal,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...data, envelope: true }),
    };
    const options = {
        retries,
    };
    const onError = (e) => {
        controller.abort();
        debug('ezs:warn')(`Break item #${this.getIndex()} [CORHALFetch] <${e}>`);
        return feed.stop(e);
    };
    const loop = async (stream, arr, afterKeyToken) => {
        if (arr.length > 0) {
            await write(stream, arr);
        }
        if (afterKeyToken) {
            const cURLBis = new URL(`${url}/after/`);
            cURLBis.search = new URLSearchParams({ envelope: true });
            try {
                const parametersBis = {
                    timeout,
                    signal: controller.signal,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ afterKeyToken }),
                };
                const responseBis = await retry(request(cURLBis.href, parametersBis), options);
                const { headers: headersBis, body: noticesBis } = await responseBis.json();
                loop(stream, noticesBis, headersBis['after-key-token']);
            } catch (e) {
                debug('ezs:error')(`Error with ${url}/after/`, e.message, e.body);
                stream.end();
            }
        } else {
            stream.end();
        }
    };
    try {
        const output = ezs.createStream(ezs.objectMode());
        const response = await retry(request(cURL.href, parameters), options);
        const { headers, body: notices } = await response.json();
        await loop(output, notices, headers['after-key-token']);
        await feed.flow(output);
    } catch (e) {
        onError(e);
    }
}
