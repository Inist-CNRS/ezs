import { basename, resolve } from 'path';
import { promisify } from 'util';
import { readFile } from 'fs';
import tar from 'tar-stream';
import { createGzip } from 'zlib';
import merge from 'lodash.merge';

// Avoid importing from fs/promise to be compatible with node 12
const readFilePromise = promisify(readFile);
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
 * @param {String} [json=true] Convert to JSON the content of each chunk
 * @param {String} [extension=json] Choose extension fo each file
 * @param {String} [additionalFile] Path to an additional file that will be add to tarball
 * @param {Boolean} [compress=false] Enable gzip compression
 */
export default function TARDump(data, feed) {
    if (!this.pack) {
        this.pack = tar.pack();
        const compress = this.getParam('compress', false);
        this.created = new Date();
        const stream = compress ? this.pack.pipe(createGzip()) : this.pack;
        feed.flow(stream).finally(() => feed.close());
    }
    if (this.isLast()) {
        const updated = new Date();
        const metadata = {
            'creationDate': this.created.toUTCString(),
            'updateDate': updated.toUTCString(),
            'itemsCounter': this.getIndex() - 1,
            'processingMSTime': this.getCumulativeTimeMS(),
        };
        const manifestArray = [metadata].concat(this.getParam('manifest', [])).filter(Boolean);
        const manifest = merge(...manifestArray);
        this.pack.entry({ name: 'manifest.json' }, JSON.stringify(manifest, null, '  '));
        const additionalFiles = []
            .concat(this.getParam('additionalFile'))
            .filter(Boolean)
            .map(filename => this.ezs.getPath()
                .map((dir) => resolve(dir, filename))
                .filter(Boolean)
                .shift()
            )
            .filter(Boolean)
            .map(fullfilename => readFilePromise(fullfilename)
                .then((fileContent) => this.pack.entry({ name: basename(fullfilename) }, fileContent)));

        Promise.all(additionalFiles)
            .catch(e => feed.stop(e))
            .finally(() => this.pack.finalize());
        return;
    }
    const json = this.getParam('json', true);
    const extension = this.getParam('extension', 'json');
    const id = this.getIndex().toString().padStart(10, '0');
    const value = json ? JSON.stringify(data).concat(eol) : data;
    const location = this.getParam('location', 'data');
    this.pack.entry({ name: `${location}/f${id}.${extension}` }, value);
    feed.end();
}
