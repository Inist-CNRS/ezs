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
 * @name XMLConvert
 * @param {String} [invert=false] change conversion (JSON to XML)
 * @returns {Object}
 * @see https://www.npmjs.com/package/xml-mapping
 */
export default {
    XMLConvert,
};
