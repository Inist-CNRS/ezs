import fetch from 'omni-fetch';

function ISTEXScroll(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }

    if (typeof data !== 'string') {
        return feed.send(data);
    }
    fetch(data)
        .then(response => response.json())
        .then((json) => {
            if (!json.total) {
                return feed.send(new Error('No result.'));
            }
            return feed.send(json);
        }).catch((err) => {
            feed.send(err);
        });
}

export default {
    ISTEXScroll,
};
