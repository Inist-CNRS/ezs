import CSV from 'csv-string';
import writeTo from 'stream-write';

function CSVParse(data, feed) {
    const separator = this.getParam('separator');
    const quote = this.getParam('quote');
    if (!this.handle) {
        this.handle = CSV.createStream({ separator, quote });
        this.handle.on('data', (obj) => feed.write(obj));
    }
    if (!this.isLast()) {
        writeTo(this.handle, data, () => feed.end());
    } else {
        this.handle.end(() => feed.close());
    }
}

/**
 * Take `String` and parse it as CSV to generate arrays
 *
 * Input:
 *
 * ```json
 * "a,b,c\nd,e,d\n"
 * ```
 *
 * Output:
 *
 * ```json
 * [
 *   ["a", "b", "c"],
 *   ["d", "e", "d"]
 * ]
 * ```
 *
 * > **Tip**: see CSVObject, to convert arrays of values to array of objects.
 *
 * @name CSVParse
 * @param {String} [separator=auto] to indicate the CSV separator
 * @param {String} [quote=auto] to indicate the CSV quote.
 * @returns {Array<String[]>}
 * @see https://github.com/Inist-CNRS/node-csv-string
 * @see CSVObject
 */
export default {
    CSVParse,
};
