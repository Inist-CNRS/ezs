/**
 * Return the last `Object` and close the feed
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
 * [shift]
 * ```
 *
 * Output:
 *
 * ```json
 * [{
 *    "a": 5
 * }]
 * ```
 *
 * @name pop
 * @see shift
 * @returns {Object}
 */
export default function shift(data, feed) {
    if (this.isLast()) {
        if (this.lastOne) {
            feed.write(this.lastOne);
        }
        feed.close();
    }
    this.lastOne = data;
    feed.end();
}
