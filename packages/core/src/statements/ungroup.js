/**
 * Take all `chunk`, and throw each item of chunks
 *
 * @returns {String}
 */
export default function ungroup(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const values = Array.isArray(data) ? data : [data];
    values.forEach(value => feed.write(value));
    return feed.end();
}
