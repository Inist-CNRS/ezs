/**
 * Takes all the chunks, and ignore the firtst N chunk
 * Input file:
 *
 * ```json
 * [{
 *    a: 1,
 * },
 * {
 *    a: 2,
 * },
 * {
 *    a: 3,
 * },
 * {
 *    a: 4,
 * },
 * {
 *    a: 5,
 * }]
 * ```
 *
 * Script:
 *
 * ```ini
 * [ignore]
 * length = 3
 *
 * ```
 *
 * Output:
 *
 * ```json
 * [{
 *    a: 4,
 * },
 * {
 *    a: 5,
 * }]
 * ```
 *
 * @name ignore
 * @param {Number} [length] Length of the feed
 * @returns {any}
 */
export default function ignore(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const len = Number(this.getParam('length'));

    if (this.counter === undefined) {
        this.counter = 0;
    }
    this.counter += 1;

    if (len && this.counter <= len) {
        return feed.end();
    }
    return feed.send(data);
}
