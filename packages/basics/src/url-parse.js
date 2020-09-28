import { URL } from 'url';

function URLParse(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const u = new URL(data);
    delete u.searchParams; // avoid inject in the pipelin the internal class <URLSearchParams>
    return feed.send(u);
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
