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
        this.whenFinish = this.input
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
            .promise();
    }
    if (this.isLast()) {
        this.whenFinish
            .then(() => feed.close())
            .catch((e) => feed.stop(e));
        this.input.end();
    } else {
        writeTo(this.input, data, () => feed.end());
    }
}
