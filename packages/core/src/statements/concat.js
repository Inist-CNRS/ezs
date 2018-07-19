/**
 * Take all `String`, concat them and thow just one
 *
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


