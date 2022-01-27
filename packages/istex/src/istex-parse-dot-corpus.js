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
    if (!data) {
        return feed.send(new Error('Empty content'));
    }
    const metadata = this.ezs.metaString(data);
    const input = this.ezs('delegate', { script: data })
        .on('data', (chunk) => feed.write({ ...metadata, ...chunk }))
        .on('error', (e) => feed.stop(e))
        .on('end', () => feed.end());
    input.write(data);
    input.end();
}
export default {
    ISTEXParseDotCorpus,
};
