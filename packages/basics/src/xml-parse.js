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

export default {
    XMLParse,
};
