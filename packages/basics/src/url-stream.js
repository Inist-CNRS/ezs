import { URL, URLSearchParams } from 'url';
import fetch from 'fetch-with-proxy';
import timeoutSignal from 'timeout-signal';
import JSONStream from 'JSONStream';

/**
 * Take `Object` as parameters of URL, throw each chunk from the result
 *
 * @name URLStream
 * @param {String} [url] URL to fecth
 * @param {String} [path=*] choose the path to split JSON result
 * @param {String} [timeout=1000] Timeout for each request (milliseconds)
 * @returns {Object}
 */
export default async function URLStream(data, feed) {
    const url = this.getParam('url');
    const path = this.getParam('path', '*');
    const timeout = this.getParam('timeout', 1000);
    const cURL = new URL(url);
    cURL.search = new URLSearchParams(data);

    if (this.isLast()) {
        return feed.close();
    }
    try {
        const response = await fetch(cURL.href, { signal: timeoutSignal(timeout) });
        if (response.status !== 200) {
            const msg = `Received status code ${response.status} (${response.statusText})`;
            return feed.send(new Error(msg));
        }
        const output = path ? response.body.pipe(JSONStream.parse(path)) : response.body;
        output.on('data', (chunk) => feed.write(chunk));
        output.on('error', (error) => feed.send(error));
        output.on('end', () => feed.end());
    } catch (error) {
        return feed.send(error);
    }
}
