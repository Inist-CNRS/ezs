import debug from 'debug';
import { URL, URLSearchParams } from 'url';
import AbortController from 'node-abort-controller';
import JSONStream from 'JSONStream';
import fetch from 'fetch-with-proxy';

/**
 * Take `String` asURL, throw each chunk from the result or
 * Take `Object` as parameters of URL, throw each chunk from the result
 *
 * @name URLStream
 * @param {String} [url] URL to fetch (by default input string is taken)
 * @param {String} [path=*] choose the path to split JSON result
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
    const cURL = new URL(url || data);
    const controller = new AbortController();
    if (url) {
        cURL.search = new URLSearchParams(data);
    }
    try {
        const response = await fetch(cURL.href, {
            timeout,
            signal: controller.signal,
        });
        if (response.status !== 200) {
            const msg = `Received status code ${response.status} (${response.statusText})`;
            throw new Error(msg);
        }
        const output = path ? response.body.pipe(JSONStream.parse(path)) : response.body;
        output.once('error', () => controller.abort());
        await feed.flow(output);
    } catch (e) {
        controller.abort();
        if (noerror) {
            return feed.send(data);
        }
        debug('ezs')(`Ignore item #${this.getIndex()} [URLConnect] <${e}>`);
        return feed.send(e);
    }
}
