import { lt, length, pipe, prop } from 'ramda';

export const termIsNotShort = pipe(
    prop('term'),
    length,
    lt(2)
);

/**
 * Remove short terms from documents (shorter than 3 characters).
 * Documents must have a `terms` key, containing an array of objects with a
 * `term` key of type string..
 *
 * Yields an array of documents with the same structure.
 *
 * Input:
 *
 * ```json
 * [{
 *   "path": "/path/to/file.txt",
 *   "terms": [{ "term": "a" }, { "term": "abcd" }]
 * }]
 * ```
 *
 * Output:
 *
 * ```json
 * [{
 *   "path": "/path/to/file.txt",
 *   "terms": [{ "term": "abcd" }]
 * }]
 * ```
 *
 * @export
 * @name TeeftRemoveShortTerms
 */
export default function TeeftRemoveShortTerms(data, feed, ctx) {
    if (ctx.isLast()) {
        return feed.close();
    }

    const docIn = data;

    const docOut = {
        ...docIn,
        terms: docIn.terms.filter(termIsNotShort),
    };
    feed.write(docOut);
    feed.end();
}
