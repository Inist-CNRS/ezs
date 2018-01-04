function BUFObject(data, feed) {
    if (this.isLast()) {
        feed.close();
    } else {
        feed.send(Buffer.from(data));
    }
}

/**
 * from `Mixed` produce Buffer with any input.
 * For example, it's useful to send string to browser.
 *
 * @name BUFObject
 * @param {undefined} none
 * @returns {Buffer}
 */
export default {
    BUFObject,
};
