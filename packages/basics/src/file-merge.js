/**
 * Take `Object` or `Buffer` and throw only one document
 *
 * ```json
 * [ fi1e1.csv, file2.csv ]
 * ```
 *
 * Script:
 *
 * ```ini
 * [use]
 * plugin = basics
 *
 * [FILELoad]
 * [FILEMerge]
 * [replace]
 * path = contentOfFile1AndFile2
 * value = self()
 *
 * ```
 *
 * Output:
 *
 * ```json
 * [
 * (...)
 * ]
 * ```
 *
 * @name FILEMerge
 * @returns {Object}
 */
export default function FILEMerge(data, feed) {
    if (this.isFirst()) {
        this.chunks = [];
        this.length = 0;
        this.isBuffer = Buffer.isBuffer(data);
    }
    if (this.isLast()) {
        feed.write(this.isBuffer ? Buffer.concat(this.chunks, this.length) : this.chunks.join(''));
        feed.close();
        return;
    }

    if (this.isBuffer) {
        this.length += data.length;
    } else {
        this.length = this.chunks.length;
    }
    this.chunks.push(data);
    feed.end();
}
