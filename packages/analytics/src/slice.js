/**
 * Take `Object` and throw the same object only if it is in the section of the
 * stream between start and start + size. stream is numbered from 1
 *
 * ```json
 * [{
 *  { id: 2000, value: 1 },
 *  { id: 2001, value: 2 },
 *  { id: 2003, value: 3 },
 *  { id: 2005, value: 4 },
 *  { id: 2007, value: 5 },
 *  { id: 2009, value: 6 },
 *  { id: 2011, value: 7 },
 *  { id: 2013, value: 8 },
 * }]
 * ```
 *
 * Script:
 *
 * ```ini
 * [use]
 * plugin = analytics
 *
 * [drop]
 *
 * ```
 *
 * Output:
 *
 * ```json
 * [
 * { "id": 2001, "value": 2 },
 * { "id": 2003, "value": 3 },
 * ]
 * ```
 *
 * @name slice
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
