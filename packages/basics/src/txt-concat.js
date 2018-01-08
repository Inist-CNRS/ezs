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
 * Take `String` and concat all items in just one string
 *
 * @name TXTConcat
 * @alias concat
 * @param {undefined} none
 * @returns {String}
 */
export default {
    TXTConcat,
};
