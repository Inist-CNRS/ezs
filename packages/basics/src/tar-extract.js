import tar from 'tar-stream';
import micromatch from 'micromatch';
import { createGunzip } from 'zlib';
import getStream from 'get-stream';
import writeTo from 'stream-write';

/**
 * Take the content of a tar file, extract some files.
 * The JSON object is sent to the output stream for each file.
 * It returns to the output stream
 *
 * ```json
 * {
 *    "id": "file name",
 *    "value": "file contents"
 * }
 * ```
 *
 * @name TARExtract
 * @param {String} [path="**\/*.json"] Regex to select the files to extract
 * @param {String} [json=true] Parse as JSON the content of each file
 * @param {Boolean} [compress=false] Enable gzip compression
 * @returns {{id: String, value: String}[]}
 */
export default function TARExtract(data, feed) {
    const filesPatern = this.getParam('path', '**/*.json');
    if (this.isFirst()) {
        const { ezs } = this;
        const json = this.getParam('json', true);
        const compress = this.getParam('compress', false);
        this.input = ezs.createStream(ezs.objectMode());
        this.output = ezs.createStream(ezs.objectMode());
        const extract = tar.extract();
        this.whenEnd = new Promise((resolve, reject) => {
            extract.on('entry', async (header, stream, next) => {
                if (micromatch.isMatch(header.name, filesPatern)) {
                    try {
                        const contentRaw = await getStream(stream);
                        if (json) {
                            const contentJson = JSON.parse(contentRaw);
                            return writeTo(
                                this.output,
                                contentJson,
                                () => next(),
                            );
                        }
                        return writeTo(
                            this.output,
                            { id: header.name, value: contentRaw },
                            () => next(),
                        );
                    } catch (e) {
                        console.warn(`WARNING: file was ignored (${header.name})`, e);
                        stream.resume();
                        return next();
                    }
                }
                stream.resume();
                return next();
            });
            extract.on('error', reject);
            extract.on('finish', resolve);
        });
        if (compress) {
            this.input.pipe(createGunzip()).pipe(extract);
        } else {
            this.input.pipe(extract);
        }
        this.whenFinish = feed.flow(this.output);
    }
    if (this.isLast()) {
        this.whenEnd.finally(() => this.output.end());
        this.whenFinish.finally(() => feed.close());
        this.input.end();
    } else {
        writeTo(this.input, data, () => feed.end());
    }
}
