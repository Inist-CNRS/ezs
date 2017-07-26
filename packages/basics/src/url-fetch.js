import request from 'request';

function URLFetch(data, feed) {
    const url = this.getParam('url');
    const target = this.getParam('target');
    const json = this.getParam('json', false);

    if (this.isLast() || !url) {
        return feed.send(data);
    }
    const options = {
        url,
        json,
    };
    request(options, (error, response, body) => {
        if (error) {
            return feed.send(error);
        }
        if (response.statusCode !== 200) {
            const msg = `Received status code ${response.statusCode} (${response.statusMessage})'`;
            return feed.send(new Error(msg));
        }
        if (target && typeof target === 'string') {
            data[target] = body;
            return feed.send(data);
        }
        return feed.send(body);
    });
}

export default {
    URLFetch,
};
