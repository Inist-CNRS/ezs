import zlib from 'zlib';
import { PassThrough } from 'stream';
import writeTo from 'stream-write';

/**
 * Take a `String` and zip it.
 *
 * Uses [gzip](https://fr.wikipedia.org/wiki/Gzip)
 * algorithm to compress strings.
 *
 * @name TXTZip
 * @param {Boolean} [unzip=false] to Unzip input
 * @returns {Buffer}
 */
export default function TXTZip(data, feed) {
    const unzip = this.getParam('unzip', false);
    if (this.isFirst()) {
        this.input = new PassThrough();
        const z = unzip ? zlib.createGunzip() : zlib.createGzip();
        this.whenFinish = feed.flow(this.input.pipe(z));
    }

    if (this.isLast()) {
        this.whenFinish.finally(() => feed.close());
        return this.input.end();
    }
    writeTo(this.input, data, () => feed.end());
}
