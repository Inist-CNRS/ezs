function OBJCount(data, feed) {
    if (this.isLast()) {
        feed.send(this.getIndex() - 1);
    } else {
        feed.end();
    }
}

/**
 * Take `Object` and count how many objects are received and sent the total
 *
 * @name OBJCount
 * @param {undefined} none
 * @returns {Number}
 */
export default {
    OBJCount,
};
