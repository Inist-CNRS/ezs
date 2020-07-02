import fetch from 'fetch-with-proxy';
import JSONStream from 'JSONStream';

function URLConnect(data, feed) {
    const url = this.getParam('url');
    const json = this.getParam('json', true);

    if (this.isFirst()) {
        const { ezs } = this;
        this.input = ezs.createStream(ezs.objectMode());
        fetch(url, {
            method: 'POST',
            body: this.input.pipe(ezs('dump')).pipe(ezs.toBuffer()),
        })
            .then((response) => {
                if (response.status !== 200) {
                    const msg = `Received status code ${response.status} (${response.statusText})'`;
                    throw new Error(msg);
                }
                return response.body;
            })
            .then((body) => {
                if (json) {
                    return body.pipe(JSONStream.parse('*'));
                }
                return body;
            })
            .then((stream) => {
                stream.on('data', (chunk) => feed.write(chunk));
                stream.on('error', (error) => feed.stop(error));
                stream.on('end', () => feed.close());
                return stream;
            })
            .catch((error) => feed.stop(error));
    }
    if (this.isLast()) {
        this.input.end();
        return;
    }
    this.input.write(data);
    feed.end();
}
/**
 * Take `Object` and send it to an URL
 * the output will be the content of URL
 *
 * @name URLConnect
 * @param {String} [url] URL to fecth
 * @param {String} [json=false] Pasre as JSON the content of URL
 * @returns {Object}
 */
export default {
    URLConnect,
};
