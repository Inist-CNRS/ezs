import { set } from 'lodash';
import debug from 'debug';
import { URL, URLSearchParams } from 'url';
import AbortController from 'node-abort-controller';
import parseHeaders from 'parse-headers';
import retry from 'async-retry';
import request from './request';



/**
 * Take `Object` as parameters of URL, throw each chunk from the result
 *
 *
 * Input:
 *
 * ```json
 * [{"q": "a"}]
 * ```
 *
 * Script:
 *
 * ```ini
 * [URLRequest]
 * url = https://api.search.net
 * ```
 *
 * Output:
 *
 * ```json
 * [
 *      {
 *          "result": "a"
 *      }
 *  ]
 * ```
 *
 * @name URLRequest
 * @param {String} [url] URL to fetch
 * @param {Boolean} [json=true] parse result as json
 * @param {String} [target] choose the key to set
 * @param {Number} [timeout=1000] Timeout in milliseconds
 * @param {Boolean} [noerror=false] Ignore all errors, the target field will remain undefined
 * @param {Number} [retries=5] The maximum amount of times to retry the connection
 * @param {String} [insert] a header response value in the result
 * @returns {Object}
 */
export default async function URLRequest(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const url = this.getParam('url');
    const json = Boolean(this.getParam('json', true));
    const target = []
        .concat(this.getParam('target'))
        .filter(Boolean)
        .shift();
    const retries = Number(this.getParam('retries', 5));
    const noerror = Boolean(this.getParam('noerror', false));
    const timeout = Number(this.getParam('timeout')) || 1000;
    const headers = parseHeaders([]
        .concat(this.getParam('header'))
        .filter(Boolean)
        .join('\n'));
    const inserts = []
        .concat(this.getParam('insert'))
        .filter(Boolean);
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
            debug('ezs:info')(`Ignore item #${this.getIndex()} [URLRequest] <${e}>`);
            return feed.send(data);
        }
        debug('ezs:warn')(`Break item #${this.getIndex()} [URLRequest] <${e}>`);
        return feed.send(e);
    };
    try {
        const response = await retry(request(cURL.href, parameters), options);
        const func = json ? 'json' : 'text';
        const value = await response[func]();
        if (target) {
            const result = typeof data === 'object' ? { ...data } : { url: data };
            set(result, target, value);
            inserts.forEach(i => set(result, i, response.headers.get(i)));
            return feed.send(result);
        }
        inserts.forEach(i => set(value, i, response.headers.get(i)));
        return feed.send(value);
    } catch (e) {
        onError(e);
    }
}
