/**
 * Take `Object`, print a character and throw the same object.
 * Useful to see the progress in the stream.
 *
 * @name tracer
 * @param {String} [print=.] character to print at each object
 * @param {String} [last=.] character to print at last call
 * @param {String} [first=.] character to print at first call
 * @returns {Object}
 */
export default function tracer(data, feed) {
    const print = String(this.getParam('print', '.'));
    const first = String(this.getParam('first', print));
    const last = String(this.getParam('last', print));
    if (this.isLast()) {
        process.stderr.write(last);
        return feed.close();
    }
    if (this.isFirst()) {
        process.stderr.write(first);
        return feed.send(data);
    }
    process.stderr.write(print);
    return feed.send(data);
}
