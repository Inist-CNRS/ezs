import CSV from 'csv-string';
import { writeTo } from './utils';

function CSVParse(data, feed) {
    const separator = this.getParam('separator');
    const quote = this.getParam('quote');
    if (!this.handle) {
        this.handle = CSV.createStream({ separator, quote });
        this.handle.on('data', obj => feed.write(obj));
    }
    if (!this.isLast()) {
        writeTo(this.handle,
            data,
            () => feed.end());
    } else {
        this.handle.end(() => feed.close());
    }
}

/**
 * Take `String` and parse CSV  to generate object
 *
 * @name CSVParse
 * @param {String} [separator=auto] to indicate the CSV separator
 * @param {String} [quote=auto] to indicate the CSV quote.
 * @returns {Object}
 * @see https://github.com/Inist-CNRS/node-csv-string
 */
export default {
    CSVParse,
};
