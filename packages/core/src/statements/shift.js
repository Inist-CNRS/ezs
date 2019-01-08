/**
 * Take the first `Object` and close the feed
 *
 * @returns {Object}
 */
export default function shift(data, feed) {
    if (this.isLast()) {
        feed.close();
    } else if (this.isFirst()) {
        feed.send(data);
    } else {
        feed.end();
    }
}
