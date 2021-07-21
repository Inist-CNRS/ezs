/**
 * Take `Object` and throw the same object again.
 *
* Input file:
 *
 * ```json
 * [{
 *    "a": 1
 * },
 * {
 *    "a": 2
 * }]
 * ```
 *
 * Script:
 *
 * ```ini
 * [transit]
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
 * }]
 * ```
 *
 *
 * @name transit
 * @returns {Object}
 */
export default function transit(data, feed) {
    return feed.send(data);
}
