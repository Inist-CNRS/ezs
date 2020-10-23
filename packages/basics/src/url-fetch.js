import fetch from 'fetch-with-proxy';
import AbortController from 'node-abort-controller';
import set from 'lodash.set';

/**
 * Take `Object` and create a new field with the content of URL.
 * Or if no target will be specified, the output will be the content of URL
 *
 * @name URLFetch
 * @param {String} [url] URL to fecth
 * @param {String} [target] choose the key to set
 * @param {String} [json=false] Pasre as JSON the content of URL
 * @param {String} [timeout=1000] Timeout for each request (milliseconds)
 * @returns {Object}
 */
export default async function URLFetch(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const url = this.getParam('url');
    const target = this.getParam('target');
    const json = this.getParam('json', false);
    const timeout = this.getParam('timeout', 1000);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    const stop = () => { clearTimeout(timeoutId); controller.abort(); };
    try {
        const response = await fetch(url, { signal: controller.signal });
        if (response.status !== 200) {
            const msg = `Received status code ${response.status} (${response.statusText})'`;
            throw new Error(msg);
        }
        const func = json ? 'json' : 'text';
        const body = await response[func]();
        if (target && typeof target === 'string' && typeof data === 'object') {
            const result = { ...data };
            set(result, target, body);
            return feed.send(result);
        }
        return feed.send(body);
    } catch (e) {
        stop();
        return feed.send(e);
    }
}
