import get from 'lodash.get';
import { store } from './globals';

/**
 * Take `Object` and throw the same object onl if there in the section of the stream between start and start + size
 * stream is numbered from 1
 *
 * @param {Number} [start=0] start of the slice
 * @param {Number} [size=10] size of the slice
 * @returns {Object}
 */
export default function slice(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const start = this.getParam('start', 1);
    const size = this.getParam('size', 10);
    const stop = start + size;
    const index = this.getIndex();

    if (index >= stop) {
        feed.close();
    } else {
        if (index >= start) {
            feed.write(data);
        }
        feed.end();
    }
}


