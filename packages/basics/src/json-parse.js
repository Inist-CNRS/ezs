import JSONStream from 'JSONStream';
import { PassThrough } from 'stream';
import yajs from 'yajson-stream';
import writeTo from 'stream-write';

function JSONParse(data, feed) {
    if (this.isFirst()) {
        const legacy = this.getParam('legacy', true);
        const separator = this.getParam('separator', '*');
        if (legacy) {
            this.input = JSONStream.parse(separator);
            this.whenFinish = feed.flow(this.input);
        } else {
            this.input = new PassThrough();
            const stream = this
                .input
                .pipe(this.ezs.toBuffer())
                .pipe(yajs(separator))
                .pipe(this.ezs((d,f) => f.send(d ? d.value : d)));
            this.whenFinish = feed.flow(stream);
        }
    }
    if (this.isLast()) {
        this.whenFinish.finally(() => feed.close());
        return this.input.end();
    }
    writeTo(this.input, data, () => feed.end());
}
/**
 * Parse a `String` to JSON and generate objects.
 *
 * See {@link https://github.com/dominictarr/JSONStream}
 *
 * #### Example 1: with separator
 *
 * Input:
 *
 * ```json
 * ["{ \"a\": 1, \"b\": 3 }", "{ \"a\": 2, \"b\": 4 }"]
 * ```
 *
 * Script:
 *
 * ```ini
 * [JSONParse]
 * separator = b
 * ```
 *
 * Output:
 *
 * ```json
 * [3, 4]
 * ```
 *
 * #### Example 2: without separator
 *
 * Input:
 *
 * ```json
 * ["{ \"a\": 1 }", "{ \"a\": 2 }"]
 * ```
 *
 * Output:
 *
 * ```json
 * [1, 2]
 * ```
 *
 * @name JSONParse
 * @param {String} [separator="*"] to split at every JSONPath found
 * @param {String} [legacy=true] use legacy or newer parser 
 * @returns {Object}
 */
export default {
    JSONParse,
};
