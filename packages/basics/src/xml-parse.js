import XMLSplitter from 'xml-splitter';

function XMLParse(data, feed) {
    if (!this.handle) {
        this.handle = new XMLSplitter(this.getParam('separator', '/'));
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
