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
 * See {@link URLParse}
 *
 * @name URLString
 * @returns {String}
 */
export default {
    URLString,
};
