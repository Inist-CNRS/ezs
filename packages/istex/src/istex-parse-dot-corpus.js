import ezs from '@ezs/core';
import { PassThrough } from 'stream';
import { writeTo } from './utils';
import istex from './istex';

ezs.use(istex);

/**
 * Parse a `.corpus` file content, and execute the action contained in the
 * `.corpus` file.
 *
 * <caption>1query.corpus</caption>
 *
 * ```ini
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
 * ```
 *
 * <caption>1notice.corpus</caption>
 *
 * ```ini
 * [ISTEX]
 * id 2FF3F5B1477986B9C617BB75CA3333DBEE99EB05
 * ```
 *
 * @name ISTEXParseDotCorpus
 * @returns {Object}
 */
function ISTEXParseDotCorpus(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const metadata = this.ezs.metaString(data);
    const input = new PassThrough({ objectMode: true });
    const output = input
        .pipe(ezs('delegate', { script: data }))
        .pipe(ezs.catch((e) => feed.write(e)))
        .on('data', (chunk) => {
            feed.write({ ...metadata, ...chunk });
        })
        .on('error', (e) => {
            feed.stop(e);
        });
    const handle = new Promise(
        (resolve) => output.on('end', resolve),
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
