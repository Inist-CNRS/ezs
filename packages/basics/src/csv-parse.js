import CSV from 'csv-string';

function CSVParse(data, feed) {
    if (!this.handle) {
        this.handle = CSV.createStream(this.getParams());
        this.handle.on('data', (obj) => {
            feed.write(obj);
        });
    }
    if (!this.isLast()) {
        this.handle.write(data);
        feed.end();
    } else {
        this.handle.end();
        feed.close();
    }
}

export default {
    CSVParse,
};
