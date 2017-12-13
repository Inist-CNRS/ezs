import JSONStream from 'JSONStream';
import { writeTo } from './utils';

function JSONParse(data, feed) {
    if (!this.handle) {
        const separator = this.getParam('separator', '*');
        this.handle = JSONStream.parse(separator);
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
    JSONParse,
};
