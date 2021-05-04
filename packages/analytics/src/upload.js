import { unlinkSync } from 'fs';
import writeTo from 'stream-write';
import tempy from 'tempy';

/**
 * save all objects in a temporary file
 * For non Buffer chunks, each object is transformed into a
 * string of characters in a raw way (no separator)
 *
 * ```json
 * [
 *           { year: 2000, dept: 54 },
 *           { year: 2001, dept: 55 },
 *           { year: 2003, dept: 54 },
 * ]
 * ```
 * Script:
 *
 * ```ini
 * [use]
 * plugin = analytics
 *
 * [upload]
 * cleanupDelay = 5
 *
 * ```
 *
 * Output:
 *
 * ```json
 *  [
 *           { id: '/tmp/31234qdE33334dZE', value:3 },
 *  ]
 * ```
 *
 * @name upload
 * @param {Number} [cleanupDelay=3600] TTL in seconds, before cleanup the file (EZS_DELAY)
 * @returns {Object}
 */
export default async function upload(data, feed) {
    const { ezs } = this;
    if (this.isFirst()) {
        this.input = ezs.createStream(ezs.objectMode());
        const stream = this.input.pipe(ezs.toBuffer());
        this.whenWrote = tempy.write(stream);
    }
    if (this.isLast()) {
        const cleanupDelayDefault = ezs.settings.cacheDelay;
        const cleanupDelay = Number(this.getParam('cleanupDelay', cleanupDelayDefault));
        this.whenWrote.then((tmpfile) => {
            setTimeout(() => unlinkSync(tmpfile), cleanupDelay * 1000);
            feed.write({ id: tmpfile, value: this.getIndex() - 1 });
            feed.close();
        }).catch(feed.stop);
        this.input.end();
    }
    return writeTo(this.input, data, () => feed.end());
}
