import { URL } from 'url';

function URLParse(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    return feed.send(new URL(data));
}

/**
 * Take `String` of URL, parse it and returns `Object`
 *
 * @name URLParse
 * @returns {Object}
 */
export default {
    URLParse,
};
