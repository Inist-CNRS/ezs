import fetch from 'fetch-with-proxy';
import AbortController from 'node-abort-controller';
import JSONStream from 'JSONStream';
import writeTo from 'stream-write';

/**
 * Take `Object` and send it to an URL
 * the output will be the content of URL
 *
 * @name URLConnect
 * @param {String} [url] URL to fecth
 * @param {String} [json=false] Pasre as JSON the content of URL
 * @returns {Object}
 */
export default function URLConnect(data, feed) {
    const url = this.getParam('url');
    const json = this.getParam('json', true);
    const { ezs } = this;
    if (this.isFirst()) {
        const controller = new AbortController();
        this.input = ezs.createStream(ezs.objectMode());
        this.whenReady = fetch(url, {
            method: 'POST',
            body: this.input.pipe(ezs('dump')).pipe(ezs.toBuffer()),
            signal: controller.signal,
        })
            .then(({ body, status, statusText }) => {
                if (status !== 200) {
                    const msg = `Received status code ${status} (${statusText})`;
                    this.whenFinish = Promise.resolve(true);
                    return feed.stop(new Error(msg));
                }
                const output = json ? body.pipe(JSONStream.parse('*')) : body;
                output.once('error', () => controller.abort());
                this.whenFinish = feed.flow(output);
                return Promise.resolve(true);
            })
            .catch((e) => feed.stop(e));
    }
    if (this.isLast()) {
        this.whenReady.finally(() => this.whenFinish.finally(() => feed.close()));
        return this.input.end();
    }
    writeTo(this.input,
        data,
        () => feed.end());
}
