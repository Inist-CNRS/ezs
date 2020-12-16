import set from 'lodash.set';
import AbortController from 'node-abort-controller';
import fetch from 'fetch-with-proxy';

/**
 * Take `Object` and create a new field with the content of URL.
 * Or if no target will be specified, the output will be the content of URL
 *
 * @name URLFetch
 * @param {String} [url] URL to fecth
 * @param {String} [target] choose the key to set
 * @param {String} [json=false] Pasre as JSON the content of URL
 * @returns {Object}
 */
export default async function URLFetch(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const url = this.getParam('url');
    const target = this.getParam('target');
    const json = this.getParam('json', false);
    const controller = new AbortController();
    try {
        const response = await fetch(url, {
            timeout: 1000,
            signal: controller.signal,
        });
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
        controller.abort();
        return feed.send(e);
    }
}
