import debug from 'debug';
import { get, set } from 'lodash';
import AbortController from 'node-abort-controller';
import parseHeaders from 'parse-headers';
import retry from 'async-retry';
import request from './request';


/**
 * Add a new field to an `Object`, with the returned content of URL.
 *
 * Or if no target is specified, the output will be the returned content of URL.
 *
 * @name URLFetch
 * @param {String} [url] URL to fetch
 * @param {String} [path] if present select value to send (by POST)
 * @param {String} [target] choose the key to set
 * @param {String} [json=false] parse as JSON the content of URL
 * @param {Number} [timeout=1000] timeout in milliseconds
 * @param {String} [mimetype="application/json"] mimetype for value of path  (if presents)
 * @param {Boolean} [noerror=false] ignore all errors, the target field will remain undefined
 * @param {Number} [retries=5] The maximum amount of times to retry the connection
 * @returns {Object}
 */
export default async function URLFetch(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const url = this.getParam('url');
    const path = this.getParam('path');
    const target = []
        .concat(this.getParam('target'))
        .filter(Boolean)
        .shift();
    const json = Boolean(this.getParam('json', false));
    const retries = Number(this.getParam('retries', 5));
    const noerror = Boolean(this.getParam('noerror', false));
    const timeout = Number(this.getParam('timeout')) || 1000;
    const headers = parseHeaders([]
        .concat(this.getParam('header'))
        .filter(Boolean)
        .join('\n'));
    const mimetype = String(this.getParam('mimetype', 'application/json'));
    const controller = new AbortController();
    const key = Array.isArray(path) ? path.shift() : path;
    const body = get(data, key);
    const parameters = {
        timeout,
        headers,
        signal: controller.signal,
    };
    const options = {
        retries,
    };
    if (body) {
        set(parameters, 'method', 'POST');
        set(
            parameters,
            'body',
            Buffer.isBuffer(body) ? body : JSON.stringify(body),
        );
        set(parameters, 'headers.content-type', mimetype);
    }
    try {
        const response = await retry(request(url, parameters), options);
        const func = json ? 'json' : 'text';
        const value = await response[func]();
        if (target) {
            const result = typeof data === 'object' ? { ...data } : { input: data };
            set(result, target, value);
            return feed.send(result);
        }
        return feed.send(value);
    } catch (e) {
        controller.abort();
        if (noerror) {
            debug('ezs:info')(`Ignore item #${this.getIndex()} [URLFetch] <${e}>`);
            return feed.send(data);
        }
        debug('ezs:warn')(`Break item #${this.getIndex()} [URLFetch] <${e}>`);
        return feed.send(e);
    }
}
