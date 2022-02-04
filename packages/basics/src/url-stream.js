import debug from 'debug';
import { URL, URLSearchParams } from 'url';
import AbortController from 'node-abort-controller';
import JSONStream from 'JSONStream';
import fetch from 'fetch-with-proxy';
import parseHeaders from 'parse-headers';


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
 * @returns {Object}
 */
export default async function URLStream(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const url = this.getParam('url');
    const path = this.getParam('path', '*');
    const noerror = Boolean(this.getParam('noerror', false));
    const timeout = Number(this.getParam('timeout')) || 1000;
    const headers = parseHeaders([]
        .concat(this.getParam('header'))
        .filter(Boolean)
        .join('\n'));
    const cURL = new URL(url || data);
    const controller = new AbortController();
    if (url) {
        cURL.search = new URLSearchParams(data);
    }
    try {
        const response = await fetch(cURL.href, {
            timeout,
            headers,
            signal: controller.signal,
        });
        if (!response.ok) {
            const msg = `Received status code ${response.status} (${response.statusText})`;
            throw new Error(msg);
        }
        const output = path
            ? response.body.pipe(JSONStream.parse(path))
            : response.body;
        output.once('error', () => controller.abort());
        await feed.flow(output);
    } catch (e) {
        controller.abort();
        if (noerror) {
            debug('ezs')(`Ignore item #${this.getIndex()} [URLStream] <${e}>`);
            return feed.send(data);
        }
        debug('ezs')(`Break item #${this.getIndex()} [URLStream] <${e}>`);
        return feed.send(e);
    }
}
