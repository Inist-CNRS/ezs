import { URL, URLSearchParams } from 'url';
import fetch from 'fetch-with-proxy';
import AbortController from 'node-abort-controller';
import JSONStream from 'JSONStream';

/**
 * Take `String` asURL, throw each chunk from the result or
 * Take `Object` as parameters of URL, throw each chunk from the result
 *
 * @name URLStream
 * @param {String} [url] URL to fetch (by default input string is taken)
 * @param {String} [path=*] choose the path to split JSON result
 * @param {String} [timeout=1000] Timeout for each request (milliseconds)
 * @returns {Object}
 */
export default async function URLStream(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const url = this.getParam('url');
    const path = this.getParam('path', '*');
    const timeout = this.getParam('timeout', 1000);
    const cURL = new URL(url || data);
    if (url) {
        cURL.search = new URLSearchParams(data);
    }
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    const stop = () => { clearTimeout(timeoutId); controller.abort(); };
    try {
        const response = await fetch(cURL.href, { signal: controller.signal });
        if (response.status !== 200) {
            const msg = `Received status code ${response.status} (${response.statusText})`;
            throw new Error(msg);
        }
        const output = path ? response.body.pipe(JSONStream.parse(path)) : response.body;
        output.once('error', stop);
        await feed.flow(output);
    } catch (error) {
        stop();
        feed.send(error);
    }
}
