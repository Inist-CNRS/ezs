/**
 * Take the first `Object` and close the feed
 *
 * @name shift
 * @returns {Object}
 */
export default function shift(data, feed) {
    feed.write(data);
    feed.close();
}


