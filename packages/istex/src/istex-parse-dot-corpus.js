import { PassThrough } from 'stream';
import { writeTo } from './utils';

/**
 * Parse a `.corpus` file content, and returns an object containing queries and
 * ids.
 *
 * @returns {Object}
 */
function ISTEXParseDotCorpus(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const metadata = this.ezs.metaString(data);
    const statement = this.ezs.fromString(data);
    const input = new PassThrough({ objectMode: true });
    const output = input
        .pipe(statement)
        .on('data', (chunk) => {
            feed.write({ ...metadata, ...chunk });
        })
        .on('error', (e) => {
            feed.write(e);
        });
    const handle = new Promise((resolve, reject) => output.on('error', reject).on('end', resolve));
    writeTo(input, metadata, () => {
        input.end(() => {
            handle.then(() => {
                feed.end();
            });
        });
    });
}


export default {
    ISTEXParseDotCorpus,
};
