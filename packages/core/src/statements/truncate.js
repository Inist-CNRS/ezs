/**
 * Takes all the chunks, and closes the feed when the total length is equal to the parameter.
 *
 * Input file:
 *
 * ```json
 * [{
 *    "a": 1
 * },
 * {
 *    "a": 2
 * },
 * {
 *    "a": 3
 * },
 * {
 *    "a": 4
 * },
 * {
 *    "a": 5
 * }]
 * ```
 *
 * Script:
 *
 * ```ini
 * [truncate]
 * length = 3
 * ```
 *
 * Output:
 *
 * ```json
 * [{
 *    "a": 1
 * },
 * {
 *    "a": 2
 * },
 * {
 *    "a": 3
 * }]
 * ```
 *
 * @name truncate
 * @param {Number} [length] Length of the feed
 * @returns {any}
 */
export default function truncate(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const len = Number(this.getParam('length'));

    if (this.total === undefined) {
        this.total = 0;
    }
    this.total += data.length || 1;

    if (len && this.total === len) {
        feed.write(data);
        return feed.close();
    }
    if (len && this.total > len) {
        const end = data.length - (this.total - len);
        feed.write(data.slice(0, end));
        return feed.close();
    }
    feed.write(data);
    return feed.end();
}
