import { PassThrough } from 'stream';
import unzipper from 'unzipper';
import micromatch from 'micromatch';
import { writeTo } from './utils';

/**
 * Take the content of a zip file, extract somd files, and yield JSON objects or TEXT.
 *
 * @name ZIPExtract
 * @param {Boolean} [path="*.json"] Regex to select the files to extract
 * @param {Boolean} [json=true] transforms each file into an Object (JSON)
 * @returns <Object>
 */
export default function ZIPExtract(data, feed) {
    const parseJSON = this.getParam('json', true);
    const filesPatern = this.getParam('path', '*.json');
    if (this.isFirst()) {
        this.input = new PassThrough();

        const output = this.input
            .pipe(unzipper.Parse())
            .on('entry', (entry) => {
                if (micromatch.isMatch(entry.path, filesPatern)) {
                    let str = '';
                    entry
                        .on('data', (buf) => {
                            str += buf.toString();
                        })
                        .on('end', () => {
                            if (parseJSON) {
                                const obj = JSON.parse(str);
                                feed.write(obj);
                            } else {
                                feed.write(str);
                            }
                        });
                } else {
                    entry.autodrain();
                }
            })
            .on('error', (e) => feed.write(e))
            .on('data', (d) => feed.write(d));

        this.whenFinish = new Promise((resolve, reject) => {
            output.on('end', resolve);
            output.on('error', reject);
        });
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
