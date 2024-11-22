import debug from 'debug';
import { URL, URLSearchParams } from 'url';
import AbortController from 'node-abort-controller';
import JSONStream from 'JSONStream';
import parseHeaders from 'parse-headers';
import retry from 'async-retry';
import request from './request';



/**
 * Take `String` as URL, throw each chunk from the result or
 * Take `Object` as parameters of URL, throw each chunk from the result
 *
 * Next examples use an API `https://httpbin.org/get?a=n` returning
 *
 * ```json
 * { args: { "a": "n" }}
 * ```
 *
 *
 * #### Example with objects
 *
 * Input:
 *
 * ```json
 * [{"a": "a"}, {"a": "b"}, {"a": "c" }]
 * ```
 *
 * Script:
 *
 * ```ini
 * [URLStream]
 * url = https://httpbin.org/get
 * path = .args
 * ```
 *
 * Output:
 *
 * ```json
 * [{"a": "a"}, {"a": "b"}, {"a": "c" }]
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
 * [URLStream]
 * path = .args
 * ```
 *
 * Output:
 *
 * ```json
 * [{"a": "a"}, {"a": "b"}, {"a": "c" }]
 * ```
 *
 * @name URLStream
 * @param {String} [url] URL to fetch (by default input string is taken)
 * @param {String} [path="*"] choose the path to split JSON result
 * @param {Number} [timeout=1000] Timeout in milliseconds
 * @param {Boolean} [noerror=false] Ignore all errors, the target field will remain undefined
 * @param {Number} [retries=5] The maximum amount of times to retry the connection
 * @returns {Object}
 */
export default async function URLStream(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const { ezs } = this;
    const url = this.getParam('url');
    const path = this.getParam('path', '*');
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
    if (url) {
        cURL.search = new URLSearchParams(data);
    }
    const onError = (e) => {
        controller.abort();
        if (noerror) {
            debug('ezs:info')(`Ignore item #${this.getIndex()} [URLStream]`, ezs.serializeError(e));
            return feed.send(data);
        }
        debug('ezs:warn')(`Break item #${this.getIndex()} [URLStream]`, ezs.serializeError(e));
        return feed.send(e);
    };
    try {
        const response = await retry(request(cURL.href, parameters), options);
        const output = path
            ? response.body.pipe(JSONStream.parse(path))
            : response.body;
        output.once('error', onError);
        await feed.flow(output);
    } catch (e) {
        onError(e);
    }
}
