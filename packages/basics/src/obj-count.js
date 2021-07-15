function OBJCount(data, feed) {
    if (this.isLast()) {
        feed.send(this.getIndex() - 1);
    } else {
        feed.end();
    }
}

/**
 * Count how many objects are received, and yield the total.
 *
 * Input:
 *
 * ```json
 * ["a", "b", "c", "d"]
 * ```
 *
 * Output:
 *
 * ```json
 * [4]
 * ```
 *
 * @name OBJCount
 * @param {undefined} none
 * @returns {Number}
 */
export default {
    OBJCount,
};
