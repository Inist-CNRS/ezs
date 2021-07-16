import unzipper from 'unzipper';
import micromatch from 'micromatch';
import writeTo from 'stream-write';

/**
 * Take the content of a zip file, extract some files.
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
 * @name ZIPExtract
 * @param {String} [path="**\/*.json"] Regex to select the files to extract
 * @returns {{id: String, value: String}[]}
 */
export default function ZIPExtract(data, feed) {
    const filesPatern = this.getParam('path', '**/*.json');
    if (this.isFirst()) {
        const { ezs } = this;
        this.input = ezs.createStream(ezs.objectMode());
        this.output = ezs.createStream(ezs.objectMode());
        this.whenEnd = this.input
            .pipe(unzipper.Parse())
            .on('entry', async (entry) => {
                if (micromatch.isMatch(entry.path, filesPatern)) {
                    const content = await entry.buffer();
                    return writeTo(
                        this.output,
                        { id: entry.path, value: content },
                        () => entry.autodrain(),
                    );
                }
                return entry.autodrain();
            })
            .promise();
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
