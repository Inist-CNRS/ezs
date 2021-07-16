import XMLSplitter from 'xml-splitter';
import writeTo from 'stream-write';

function XMLParse(data, feed) {
    if (!this.handle) {
        const separator = this.getParam('separator', '/');
        this.handle = new XMLSplitter(separator);
        this.handle.on('data', (obj) => feed.write(obj));
    }
    if (!this.isLast()) {
        writeTo(this.handle.stream, data, () => feed.end());
    } else {
        this.handle.stream.end();
        process.nextTick(() => {
            feed.close();
        });
        /*
         this.handle.stream has been created by sax@0.5,
         and I cannot handle the "end" event (and I don't know why)
         so I use nextTick instead of end().
         It's badly, but it works in many cases
         */
    }
}

/**
 * Take `String` as XML input, parse it and split it in multi document at each path found
 *
 * Input:
 *
 * ```json
 <* ["<a><b>x</b><b>y</b></a>"]
 * ```
 *
 * Script:
 *
 * ```ini
 * [XMLParse]
 * separator: /a/b
 * ```
 *
 * Output:
 *
 * ```json
 * ["x", "y"]
 * ```
 *
 * @name XMLParse
 * @param {String} [separator="/"] choose a character for flatten keys
 * @returns {Object}
 * @see https://www.npmjs.com/package/xml-splitter
 */
export default {
    XMLParse,
};
