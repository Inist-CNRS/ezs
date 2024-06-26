import { StringDecoder } from 'string_decoder';

function TXTParse(data, feed) {
    if (!this.decoder) {
        this.decoder = new StringDecoder('utf8');
        this.remainder = '';
        this.counter = 0;
    }
    if (this.isLast()) {
        this.remainder += this.decoder.end();
        if (this.remainder && this.counter > 1) {
            feed.write(this.remainder);
        }
        return feed.end();
    }
    let separator;
    try {
        const val = '"'.concat(this.getParam('separator', '\n')).concat('"');
        separator = JSON.parse(val);
    } catch (e) {
        separator = '\n';
    }

    let lines;
    if (Buffer.isBuffer(data)) {
        lines = this.decoder.write(data).split(separator);
    } else if (typeof data === 'string') {
        lines = data.split(separator);
    } else {
        lines = ['', ''];
    }
    lines.unshift(this.remainder + lines.shift());
    this.remainder = lines.pop();
    lines.forEach((line) => {
        feed.write(line);
    });
    this.counter += lines.length;
    feed.end();
}

/**
 * Take a `String` and split it at each separator found.
 *
 * Input:
 *
 * ```json
 * ["a\nb\n", "c\nd\n"]
 * ```
 *
 * Output:
 *
 * ```json
 * ["a", "b", "c", "d"]
 * ```
 *
 * @name TXTParse
 * @alias split
 * @alias segmenter
 * @param {String} [separator="\n"] choose character which trigger the split
 * @returns {String}
 */
export default {
    TXTParse,
};
