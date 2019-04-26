/**
 * Takes all the chunks, and closes the feed when the total length is equal to the parameter
 *
 * @param {Number} [length] Length of the feed
 * @returns {Mixed}
 */
export default function truncate(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const len = Number(this.getParam('length'));

    if (this.total === undefined) {
        this.total = 0;
    }
    this.total += data.length;

    if (len && this.total === len) {
        feed.write(data);
        return feed.close();
    }
    if (len && this.total > len) {
        const end = data.length - (this.total - len);
        if (data.slice) {
            feed.write(data.slice(0, end));
        } else {
            feed.write(data);
        }
        return feed.close();
    }
    feed.write(data);
    return feed.end();
}
