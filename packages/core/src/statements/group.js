import settings from '../settings';

/**
 * Take all `chunk`s, and throw one array of chunks
 *
 * ```json
 * [
 *      'a',
 *      'b',
 *      'c',
 *      'd',
 *      'e',
 *      'f',
 *      'g',
 *      'h',
 * ]
 * ```
 *
 * Script:
 *
 * ```ini
 * [group]
 * length = 3
 *
 * ```
 *
 * Output:
 *
 * ```json
 * [
 *      [ 'a', 'b', 'c' ],
 *      [ 'd', 'e', 'f' ],
 *      [ 'g', 'h' ],
 * ]
 * ```
 *
 * @name group
 * @param {Number} [length] Size of each partition
 * @returns {String}
 */
export default function group(data, feed) {
    const len = Number(this.getParam('length', settings.highWaterMark.object));
    const size = Number(this.getParam('size', len));

    if (this.isFirst()) {
        this.buffer = [];
    }
    if (this.isLast()) {
        if (this.buffer && this.buffer.length > 0) {
            feed.write(Array.from(this.buffer));
        }
        return feed.close();
    }
    this.buffer.push(data);
    if (this.buffer.length >= size) {
        const buf = Array.from(this.buffer);
        this.buffer = [];
        return feed.send(buf);
    }
    return feed.end();
}
