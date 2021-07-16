import XML from 'xml-mapping';

function XMLConvert(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const func = this.getParam('invert', false) ? 'dump' : 'load';
    const opts = {
        header: this.getParam('prologue', false),
    };
    feed.send(XML[func](data, opts));
}

/**
 * Convert each chunk as XML String to JSON Object
 *
 * #### Example 1: XML to JSON (default parameters)
 *
 * Input:
 *
 * ```json
 * [
 *   "<xml>A</xml>",
 *   "<xml>B</xml>"
 * ]
 * ```
 *
 * Output:
 *
 * ```json
 * [
 *   { "xml": { "$t": "A" } },
 *   { "xml": { "$t": "B" } }
 * ]
 * ```
 *
 * #### Example 2: JSON to XML (invert parameter true)
 *
 * Input:
 *
 * ```json
 * [
 *   { "x": { "a": 1 } },
 *   { "x": { "a": 2 } }
 * ]
 * ```
 *
 * Output:
 *
 * ```json
 * [
 *   "<x a=\"1\"/>",
 *   "<x a=\"2\"/>",
 * ]
 * ```
 *
 * #### Example 3: JSON to XML (prologue and invert true)
 *
 * Input:
 *
 * ```json
 * [
 *   { "x": { "a": 1 } },
 *   { "x": { "a": 2 } }
 * ]
 * ```
 *
 * Output:
 *
 * ```json
 * [
 *   "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<x a=\"1\"/>",
 *   "<?xml version=\"1.0\" encoding=\"utf-8\"?>\n<x a=\"2\"/>",
 * ]
 *
 * @name XMLConvert
 * @param {String} [invert=false] change conversion (JSON to XML)
 * @param {String} [prologue=false] add XML prologue
 * @returns {Object}
 * @see https://www.npmjs.com/package/xml-mapping
 */
export default {
    XMLConvert,
};
