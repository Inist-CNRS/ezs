import { PassThrough } from 'stream';
import { writeTo } from './utils';

/**
 * Parse a `.corpus` file content, and execute the action contained in the
 * `.corpus` file.
 *
 * @example <caption>1query.corpus</caption>
 * [ISTEX]
 * query = language.raw:rum
 * field = doi
 * field = author
 * field = title
 * field = language
 * field = publicationDate
 * field = keywords
 * field = host
 * field = fulltext
 *
 * @example <caption>1notice.corpus</caption>
 * [ISTEX]
 * id 2FF3F5B1477986B9C617BB75CA3333DBEE99EB05
 *
 * @name ISTEXParseDotCorpus
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
    const handle = new Promise(
        (resolve, reject) => output.on('error', reject).on('end', resolve),
    );
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
