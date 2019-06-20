import { URL, URLSearchParams } from 'url';
import fetch from 'fetch-with-proxy';
import JSONStream from 'JSONStream';

function URLStream(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }

    const url = this.getParam('url');
    const path = this.getParam('path', '*');
    const cURL = new URL(url);
    cURL.search = new URLSearchParams(data);

    fetch(cURL.href)
        .then((response) => {
            if (response.status !== 200) {
                const msg = `Received status code ${response.statusCode} (${response.statusMessage})'`;
                throw new Error(msg);
            }
            return response.body;
        })
        .then((body) => {
            if (path) {
                return body.pipe(JSONStream.parse(path));
            }
            return body;
        })
        .then((stream) => {
            stream.on('data', chunk => feed.write(chunk));
            stream.on('error', error => feed.stop(error));
            stream.on('end', () => feed.close());
            return stream;
        })
        .catch(error => feed.stop(error));
}

/**
 * Take `Object` as parameters of URL, throw each chunk from the result
 *
 * @name URLStream
 * @param {String} [url] URL to fecth
 * @param {String} [target] choose the key to set
 * @param {String} [json=false] Pasre as JSON the content of URL
 * @returns {Object}
 */
export default {
    URLStream,
};
