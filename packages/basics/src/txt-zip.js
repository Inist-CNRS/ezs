import zlib from 'zlib';
import { PassThrough } from 'stream';

function TXTZip(data, feed) {
    if (this.isFirst()) {
        this.input = new PassThrough();
        this.gzip = zlib.createGzip();
        const output = this.input.pipe(this.gzip);
        output.on('data', d => feed.write(d));
        output.on('end', () => feed.close());
        output.on('error', e => feed.stop(e));
    }

    if (this.isLast()) {
        return this.input.end();
    }

    if (!this.input.write(data)) {
        this.input.once('drain', () => feed.end());
    } else {
        feed.end();
    }
}

/**
 * Take a String and zip it
 *
 * @name TXTZip
 * @returns {Buffer}
 */
export default {
    TXTZip,
};
