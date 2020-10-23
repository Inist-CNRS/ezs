import { PassThrough } from 'stream';
import unzipper from 'unzipper';
import micromatch from 'micromatch';
import writeTo from 'stream-write';

/**
 * Take the content of a zip file, extract some files, and yield JSON.
 * By default, files are scanned as JSON files.
 * The JSON object is sent to the output stream for each file.
 * If JSON option is disabled, it returns to the output stream
 * an object for each file found like :
 *
 *  {
 *     id: file name,
 *     value: file contents,
 *  }
 *
 * @name ZIPExtract
 * @param {Boolean} [path="**\/*.json"] Regex to select the files to extract
 * @param {Boolean} [json=true] transforms each file into an Object (JSON)
 * @returns <Object>
 */
export default function ZIPExtract(data, feed) {
    const parseJSON = this.getParam('json', true);
    const filesPatern = this.getParam('path', '**/*.json');
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
                                try {
                                    const obj = JSON.parse(str);
                                    feed.write(obj);
                                } catch (e) {
                                    feed.write(e);
                                }
                            } else {
                                feed.write({ id: entry.path, value: str });
                            }
                        });
                } else {
                    entry.autodrain();
                }
            });
        this.whenFinish = feed.flow(output);
    }
    if (this.isLast()) {
        this.whenFinish.finally(() => feed.close());
        this.input.end();
    } else {
        writeTo(this.input, data, () => feed.end());
    }
}
