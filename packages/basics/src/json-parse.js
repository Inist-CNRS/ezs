import JSONStream from 'JSONStream';
import writeTo from 'stream-write';

function JSONParse(data, feed) {
    if (this.isFirst()) {
        const separator = this.getParam('separator', '*');
        this.input = JSONStream.parse(separator);
        this.whenFinish = feed.flow(this.input);
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
 * @returns {Object}
 */
export default {
    JSONParse,
};
