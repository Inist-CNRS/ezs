function TXTConcat(data, feed) {
    if (this.buffer === undefined) {
        this.buffer = '';
    }
    if (this.isLast()) {
        feed.send(this.buffer);
        feed.close();
    } else {
        this.buffer = this.buffer.concat(data);
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
