import JSONStream from 'JSONStream';
import writeTo from 'stream-write';
import AbortController from 'node-abort-controller';
import fetch from 'fetch-with-proxy';

/**
 * Take `Object` and send it to an URL
 * the output will be the content of URL
 *
 * @name URLConnect
 * @param {String} [url] URL to fecth
 * @param {String} [json=false] Pasre as JSON the content of URL
 * @param {Number} [timeout=1000] Timeout in milliseconds
 * @param {Boolean} [noerror=false] Ignore all errors
 * @returns {Object}
 */
export default function URLConnect(data, feed) {
    const url = this.getParam('url');
    const noerror = Boolean(this.getParam('noerror', false));
    const json = this.getParam('json', true);
    const { ezs } = this;
    if (this.isFirst()) {
        const timeout = Number(this.getParam('timeout')) || 1000;
        const controller = new AbortController();
        this.input = ezs.createStream(ezs.objectMode());
        this.whenReady = fetch(url, {
            method: 'POST',
            body: this.input.pipe(ezs('dump')).pipe(ezs.toBuffer()),
            timeout,
            signal: controller.signal,
        })
            .then(({ body, status, statusText }) => {
                if (status !== 200) {
                    const msg = `Received status code ${status} (${statusText})`;
                    throw new Error(msg);
                }
                const output = json ? body.pipe(JSONStream.parse('*')) : body;
                output.once('error', () => controller.abort());
                this.whenFinish = feed.flow(output);
                return Promise.resolve(true);
            })
            .catch((e) => {
                controller.abort();
                this.whenFinish = Promise.resolve(true);
                if (!noerror) {
                    feed.stop(e);
                }
                return Promise.resolve(true);
            });
    }
    if (this.isLast()) {
        this.whenReady.finally(() => this.whenFinish.finally(() => feed.close()));
        return this.input.end();
    }
    writeTo(this.input,
        data,
        () => feed.end());
}
