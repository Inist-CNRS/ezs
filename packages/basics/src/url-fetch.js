import debug from 'debug';
import get from 'lodash.get';
import set from 'lodash.set';
import AbortController from 'node-abort-controller';
import fetch from 'fetch-with-proxy';

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
 * @returns {Object}
 */
export default async function URLFetch(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const url = this.getParam('url');
    const path = this.getParam('path');
    const target = this.getParam('target');
    const json = Boolean(this.getParam('json', false));
    const noerror = Boolean(this.getParam('noerror', false));
    const timeout = Number(this.getParam('timeout')) || 1000;
    const mimetype = String(this.getParam('mimetype', 'application/json'));
    const controller = new AbortController();
    const key = Array.isArray(path) ? path.shift() : path;
    const body = get(data, key);
    const parameters = {
        timeout,
        signal: controller.signal,
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
        const response = await fetch(url, parameters);
        const func = json ? 'json' : 'text';
        const value = await response[func]();
        if (target && typeof target === 'string' && typeof data === 'object') {
            const result = { ...data };
            set(result, target, value);
            return feed.send(result);
        }
        return feed.send(value);
    } catch (e) {
        controller.abort();
        if (noerror) {
            return feed.send(data);
        }
        debug('ezs')(`Ignore item #${this.getIndex()} [URLConnect] <${e}>`);
        return feed.send(e);
    }
}
