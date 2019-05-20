import { PassThrough } from 'stream';
import unzipper from 'unzipper';
import { writeTo } from './utils';

/**
 * Take the content of a zip file, extract JSON files, and yield JSON objects.
 *
 * The zip file comes from dl.istex.fr, and the `manifest.json` is not
 * extracted.
 *
 * @name ISTEXUnzip
 * @returns Array<Object>
 */
export default function ISTEXUnzip(data, feed) {
    if (this.isFirst()) {
        this.input = new PassThrough();

        const output = this.input
            .pipe(unzipper.Parse())
            .on('entry', (entry) => {
                const fileName = entry.path;
                if (fileName === 'manifest.json') {
                    entry.autodrain();
                } else if (fileName.endsWith('.json')) {
                    let str = '';
                    entry
                        .on('data', (buf) => {
                            str += buf.toString();
                        })
                        .on('end', () => {
                            const obj = JSON.parse(str);
                            feed.write(obj);
                        });
                } else {
                    entry.autodrain();
                }
            })
            .on('error', e => feed.write(e))
            .on('data', d => feed.write(d));

        this.whenFinish = new Promise((resolve, reject) => {
            output.on('end', resolve);
            output.on('error', reject);
        });
    }
    if (this.isLast()) {
        this.whenFinish
            .then(() => feed.close())
            .catch(e => feed.stop(e));
        this.input.end();
    } else {
        writeTo(this.input, data, () => feed.end());
    }
}

// See https://github.com/touv/node-ezs/blob/master/src/statements/delegate.js
