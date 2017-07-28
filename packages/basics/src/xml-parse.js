import XMLSplitter from 'xml-splitter';

function XMLParse(data, feed) {
    if (!this.handle) {
        const separator = this.getParam('separator', '/');
        this.handle = new XMLSplitter(separator);
        this.handle.on('data', (obj) => {
            feed.write(obj);
        });
    }
    if (!this.isLast()) {
        this.handle.stream.write(data);
    }
    feed.end();
}

export default {
    XMLParse,
};
