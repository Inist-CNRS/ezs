import { format } from 'url';

function URLString(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    return feed.send(format(data));
}

/**
 * Take an `Object` representing an URL and stringify it.
 *
 * @name URLString
 * @returns {String}
 * @see URLParse
 */
export default {
    URLString,
};
