import fetch from 'fetch-with-proxy';
import JSONStream from 'JSONStream';

/**
 * Take `Object` and send it to an URL
 * the output will be the content of URL
 *
 * @name URLConnect
 * @param {String} [url] URL to fecth
 * @param {String} [json=false] Pasre as JSON the content of URL
 * @returns {Object}
 */
export default async function URLConnect(data, feed) {
    const url = this.getParam('url');
    const json = this.getParam('json', true);
    const { ezs } = this;
    if (this.isFirst()) {
        this.input = ezs.createStream(ezs.objectMode());
        this.whenReady = fetch(url, {
            method: 'POST',
            body: this.input.pipe(ezs('dump')).pipe(ezs.toBuffer()),
        })
            .then(({ body, status, statusText }) => {
                if (status !== 200) {
                    const msg = `Received status code ${status} (${statusText})`;
                    return feed.stop(new Error(msg));
                }
                const output = json ? body.pipe(JSONStream.parse('*')) : body;
                output.on('data', (chunk) => feed.write(chunk));
                output.on('error', (e) => feed.write(e));
                this.whenFinish = new Promise((resolve) => output.on('end', resolve));
                return output;
            })
            .catch((e) => feed.stop(e));
    }
    if (this.isLast()) {
        return this.whenReady.then(() => {
            this.whenFinish
                .then(() => feed.close())
                .catch(/* istanbul ignore next */(e) => feed.stop(e));
            return this.input.end();
        });
    }
    ezs.writeTo(this.input,
        data,
        () => feed.end());
}
