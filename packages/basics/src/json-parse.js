import JSONStream from 'JSONStream';

function JSONParse(data, feed) {
    if (!this.handle) {
        const separator = this.getParam('separator', '*');
        this.handle = JSONStream.parse(separator);
        this.handle.on('data', (obj) => {
            feed.write(obj);
        });
    }
    if (!this.isLast()) {
        this.handle.write(data);
        feed.end();
    } else {
        feed.close();
    }
}

export default {
    JSONParse,
};
