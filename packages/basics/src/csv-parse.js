import CSV from 'csv-string';
import writeTo from 'stream-write';
import { StringDecoder } from 'string_decoder';

function CSVParse(data, feed) {
    const separator = this.getParam('separator');
    const quote = this.getParam('quote');
    if (!this.decoder) {
        this.decoder = new StringDecoder('utf8');
        this.input = CSV.createStream({ separator, quote });
        this.whenFinish = feed.flow(this.input);
    }
    if (this.isLast()) {
        writeTo(
            this.input,
            this.decoder.end(),
            () => this.input.end(),
        );
        this.whenFinish.finally(() => feed.close());
        return ;
    }
    writeTo(
        this.input,
        Buffer.isBuffer(data) ? this.decoder.write(data) : data,
        () => feed.end(),
    );
}

/**
 * Take `String` and parse it as CSV to generate arrays.
 *
 * See:
 *
 * - {@link CSVObject}
 * - {@link https://github.com/Inist-CNRS/node-csv-string}
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
 */
export default {
    CSVParse,
};
