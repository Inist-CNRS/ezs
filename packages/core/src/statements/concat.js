/**
 * Take all `String`, concat them and throw just one.
 *
 * ```json
 * [
 *      "a",
 *      "b",
 *      "c"
 * ]
 * ```
 *
 * Script:
 *
 * ```ini
 * [concat]
 * beginWith = <
 * joinWith = |
 * endWith = >
 * ```
 *
 * Output:
 *
 * ```json
 * [
 *      "<a|b|c>"
 * ]
 * ```
 *
 * @name concat
 * @param {String} [beginWith] Add value at the begin
 * @param {String} [joinWith] use value to join 2 chunk
 * @param {String} [endWith] Add value at the end
 * @returns {String}
 */
export default function concat(data, feed) {
    const beginWith = this.getParam('beginWith', '');
    const joinWith = this.getParam('joinWith', '');
    const endWith = this.getParam('endWith', '');

    if (this.buffer === undefined) {
        this.buffer = beginWith;
    }
    if (this.isLast()) {
        feed.send(this.buffer.concat(endWith));
        return feed.close();
    }
    if (!this.isFirst()) {
        this.buffer = this.buffer.concat(joinWith);
    }
    this.buffer = this.buffer.concat(data);
    return feed.end();
}
