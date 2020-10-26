import zlib from 'zlib';
import { PassThrough } from 'stream';
import writeTo from 'stream-write';

/**
 * Take a String and zip it
 *
 * @name TXTZip
 * @returns {Buffer}
 */
export default function TXTZip(data, feed) {
    if (this.isFirst()) {
        this.input = new PassThrough();
        this.whenFinish = feed.flow(this.input.pipe(zlib.createGzip()));
    }

    if (this.isLast()) {
        this.whenFinish.finally(() => feed.close());
        return this.input.end();
    }
    writeTo(this.input, data, () => feed.end());
}
