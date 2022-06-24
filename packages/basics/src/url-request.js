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
 * @param {Number} [timeout=1000] Timeout in milliseconds
 * @param {Boolean} [noerror=false] Ignore all errors, the target field will remain undefined
 * @param {Number} [retries=5] The maximum amount of times to retry the connection
 * @returns {Object}
 */
export default async function URLRequest(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const url = this.getParam('url');
    const json = Boolean(this.getParam('json', true));
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
    cURL.search = new URLSearchParams(data);
    const onError = (e) => {
        controller.abort();
        if (noerror) {
            debug('ezs')(`Ignore item #${this.getIndex()} [URLRequest] <${e}>`);
            return feed.send(data);
        }
        debug('ezs')(`Break item #${this.getIndex()} [URLRequest] <${e}>`);
        return feed.send(e);
    };
    try {
        const response = await retry(request(cURL.href, parameters), options);
        const func = json ? 'json' : 'text';
        const value = await response[func]();
        feed.send(value);
    } catch (e) {
        onError(e);
    }
}
