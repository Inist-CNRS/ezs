import { format } from 'url';

function URLString(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    return feed.send(format(data));
}

/**
 * Take `Object` representing a URL and stringify it
 *
 * @name URLString
 * @returns {String}
 */
export default {
    URLString,
};
