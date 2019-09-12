/**
 * Take all `chunk`s, and throw one item for every chunk
 *
 * @name ungroup
 * @returns {String}
 * @see group
 */
export default function ungroup(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const values = Array.isArray(data) ? data : [data];
    values.forEach((value) => feed.write(value));
    return feed.end();
}
