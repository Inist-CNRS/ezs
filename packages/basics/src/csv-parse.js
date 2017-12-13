import CSV from 'csv-string';
import { writeTo } from './utils';

function CSVParse(data, feed) {
    if (!this.handle) {
        this.handle = CSV.createStream(this.getParams());
        this.handle.on('data', obj => feed.write(obj));
    }
    if (!this.isLast()) {
        writeTo(this.handle,
            data,
            () => feed.end());
    } else {
        this.handle.end(() => feed.close());
    }
}

export default {
    CSVParse,
};
