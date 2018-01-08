import XMLSplitter from 'xml-splitter';
import { writeTo } from './utils';

function XMLParse(data, feed) {
    if (!this.handle) {
        const separator = this.getParam('separator', '/');
        this.handle = new XMLSplitter(separator);
        this.handle.on('data', obj => feed.write(obj));
    }
    if (!this.isLast()) {
        writeTo(this.handle.stream,
          data,
          () => feed.end());
    } else {
        this.handle.stream.end(() => feed.close());
    }
}

/**
 * Take `String` as XML input, parse it and split it in multi document at each path found
 *
 * @name XMLParse
 * @param {String} [url] URL to fecth
 * @param {String} [target] choose the key to set
 * @param {String} [separator=/] choose a character for flatten keys
 * @returns {Object}
 * @see https://www.npmjs.com/package/xml-splitter
 */
export default {
    XMLParse,
};
