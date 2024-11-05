import { StringDecoder } from 'string_decoder';
import BibtexParser from 'bib2json';

function BIBParse(data, feed) {
    if (!this.decoder) {
        this.decoder = new StringDecoder('utf8');
        this.remainder = '';
        this.counter = 0;
        this.parser = new BibtexParser((entry) => {
            feed.write(entry);
        });
    }
    if (this.isLast()) {
        this.remainder += this.decoder.end();
        if (this.remainder && this.counter > 1) {
            this.parser.parse(this.remainder);
        }
        return feed.close();
    }
    let chunk;
    if (Buffer.isBuffer(data)) {
        chunk = this.decoder.write(data);
    } else if (typeof data === 'string') {
        chunk = data;
    } else {
        chunk = '';
    }
    this.parser.parse(chunk);
    this.counter += 1;
    feed.end();
}

/**
 * Take a `String` and split it at bibtext entry.
 *
 * Input:
 *
 * ```json
 * ["@article{my_article,\ntitle = {Hello world},\n", "journal = \"Some Journal\"\n"]
 * ```
 *
 * Output:
 *
 * ```json
 * ["a", "b", "c", "d"]
 * ```
 *
 * @name BIBParse
 * @returns {Object}
 */
export default {
    BIBParse,
};
