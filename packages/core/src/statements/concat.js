import { StringDecoder } from 'string_decoder';
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
    if (!this.decoder) {
        this.decoder = new StringDecoder('utf8');
    }
    const beginWith = this.getParam('beginWith', '');
    const joinWith = this.getParam('joinWith', '');
    const endWith = this.getParam('endWith', '');

    if (this.buffer === undefined) {
        this.buffer = [];
    }
    if (this.isLast()) {
        this.buffer.push(this.decoder.end());
        feed.send(beginWith.concat(this.buffer.filter(Boolean).join(joinWith)).concat(endWith));
        return feed.close();
    }
    const value = Buffer.isBuffer(data) ? this.decoder.write(data) : data;
    this.buffer.push(value);
    return feed.end();
}

