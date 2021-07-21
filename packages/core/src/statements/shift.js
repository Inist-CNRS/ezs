/**
 * Return the first `Object` and close the feed
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
 *    "a": 1
 * }]
 * ```
 *
 * @name shift
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
