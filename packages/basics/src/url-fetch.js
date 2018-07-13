import fetch from 'fetch-with-proxy';

function URLFetch(data, feed) {
    const url = this.getParam('url');
    const target = this.getParam('target');
    const json = this.getParam('json', false);

    if (this.isLast() || !url) {
        return feed.send(data);
    }
    fetch(url)
    .then((response) => {
        if (response.status !== 200) {
            const msg = `Received status code ${response.statusCode} (${
          response.statusMessage
        })'`;
            throw new Error(msg);
        }
        return json ? response.json() : response.text();
    })
    .then((body) => {
        if (target && typeof target === 'string' && typeof data === 'object') {
            data[target] = body;
            return feed.send(data);
        }
        feed.send(body);
    })
    .catch(error => feed.send(error));
}

/**
 * Take `Object` and create a new field with the content of URL.
 * Or if no target will be specified, the output will be the content of URL
 *
 * @name URLFetch
 * @param {String} [url] URL to fecth
 * @param {String} [target] choose the key to set
 * @param {String} [json=false] Pasre as JSON the content of URL
 * @returns {Object}
 */
export default {
    URLFetch,
};
