import tar from 'tar-stream';
import { createGzip } from 'zlib';
import merge from 'lodash.merge';

const eol = '\n';

/**
 * Take all recevied objects and build a tar file
 *
 * ```json
 * {
 * }
 * ```
 *
 * @name TARDump
 * @param {String} [manifest] Location path to store files in the tarball
 * @param {String} [location=data] Location path to store files in the tarball
 * @param {String} [json=true] Parse as JSON the content of each file
 * @param {Boolean} [compress=false] Enable gzip compression
 */
export default function TARDump(data, feed) {
    if (!this.pack) {
        this.pack = tar.pack();
        const compress = this.getParam('compress', false);
        const d = new Date();
        const manifest = merge({ created: d.toUTCString() }, [].concat(this.getParam('manifest', [])).filter(Boolean));
        this.pack.entry({ name: 'manifest.json' }, JSON.stringify(manifest, null, '  '));
        const stream = compress ? this.pack.pipe(createGzip()) : this.pack;
        feed.flow(stream).finally(() => feed.close());
    }
    if (this.isLast()) {
        this.pack.finalize();
        return;
    }
    const id = this.getIndex().toString().padStart(10, '0');
    const value = JSON.stringify(data).concat(eol);
    const location = this.getParam('location', 'data');
    this.pack.entry({ name: `${location}/f${id}.json` }, value);
    feed.end();
}
