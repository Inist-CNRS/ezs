/**
 * Take `Object` and throw the same object onl if there in the section of the stream between start and start + size
 * stream is numbered from 1
 *
 * @param {Number} [start=0] start of the slice
 * @param {Number} [size=10] size of the slice
 * @returns {Object}
 */
export default function slice(data, feed) {
    if (this.isLast()) {
        feed.close();
        return;
    }
    const start = Number(this.getParam('start')) || 1;
    const size = Number(this.getParam('size')) || 10;
    const stop = start + size;
    const index = Number(this.getIndex());

    if (index >= stop) {
        feed.close();
    } else {
        if (index >= start) {
            feed.write(data);
        }
        feed.end();
    }
}
