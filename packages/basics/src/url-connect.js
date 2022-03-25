import JSONStream from 'JSONStream';
import debug from 'debug';
import writeTo from 'stream-write';
import AbortController from 'node-abort-controller';
import parseHeaders from 'parse-headers';
import retry from 'async-retry';
import request from './request';

/**
 * Take an `Object` and send it to an URL.
 *
 * The output will be the returned content of URL.
 *
 * Useful to send JSON data to an API and get results.
 *
 * @name URLConnect
 * @param {String} [url] URL to fetch
 * @param {String} [json=false] Parse as JSON the content of URL
 * @param {Number} [timeout=1000] Timeout in milliseconds
 * @param {Boolean} [noerror=false] Ignore all errors
 * @param {Number} [retries=5] The maximum amount of times to retry the connection
 * @returns {Object}
 */
export default async function URLConnect(data, feed) {
    const url = this.getParam('url');
    const retries = Number(this.getParam('retries', 5));
    const noerror = Boolean(this.getParam('noerror', false));
    const json = this.getParam('json', true);
    const { ezs } = this;
    if (this.isFirst()) {
        const timeout = Number(this.getParam('timeout')) || 1000;
        const headers = parseHeaders([]
            .concat(this.getParam('header'))
            .filter(Boolean)
            .join('\n'));
        const controller = new AbortController();
        this.input = ezs.createStream(ezs.objectMode());
        const output = ezs.createStream(ezs.objectMode());
        this.whenFinish = feed.flow(output);

        writeTo(this.input, data, () => feed.end());

        const bodyIn = this.input.pipe(ezs('dump')).pipe(ezs.toBuffer());
        const parameters = {
            method: 'POST',
            body: bodyIn,
            timeout,
            headers,
            signal: controller.signal,
        };
        const options = {
            retries,
        };
        const onError = (e) => {
            controller.abort();
            if (!noerror) {
                debug('ezs')(
                    `Break item #${this.getIndex()} [URLConnect] <${e}>`,
                );
                feed.stop(e);
            } else {
                debug('ezs')(
                    `Ignore item #${this.getIndex()} [URLConnect] <${e}>`,
                );
            }
            output.end();
        };
        try {
            const response = await retry(request(url, parameters), options);
            const bodyOut = json ? response.body.pipe(JSONStream.parse('*')) : response.body;
            bodyOut.once('error', onError);
            bodyOut.pipe(output);
        }
        catch (e) {
            onError(e);
        };
        return;
    }
    if (this.isLast()) {
        this.input.end();
        this.whenFinish.finally(() => feed.close());
        return;
    }
    writeTo(this.input, data, () => feed.end());
}
