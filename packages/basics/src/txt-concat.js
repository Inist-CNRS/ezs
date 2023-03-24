import { StringDecoder } from 'string_decoder';

function TXTConcat(data, feed) {

    if (!this.decoder) {
        this.decoder = new StringDecoder('utf8');
    }
    if (this.buffer === undefined) {
        this.buffer = '';
    }
    if (this.isLast()) {
        this.decoder.end();
        feed.send(this.buffer);
        feed.close();
    } else {
        this.buffer = this.buffer.concat(Buffer.isBuffer(data) ? this.decoder.write(data) : data);
        feed.end();
    }
}

/**
 * Concatenate all `String` items into one string
 *
 * Input:
 *
 * ```json
 * ["a", "b"]
 * ```
 *
 * Output:
 *
 * ```json
 * ["ab"]
 * ```
 *
 * @name TXTConcat
 * @alias concat
 * @param {undefined} none
 * @returns {String}
 */
export default {
    TXTConcat,
};
