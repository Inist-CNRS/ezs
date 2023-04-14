import { gte, length, pipe, prop } from 'ramda';

export const termIsNotLong = pipe(
    prop('term'),
    length,
    gte(50)
);

/**
 * Remove long terms from documents (longer than 50 characters).
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
 *   "terms": [{ "term": "this very long term should really be removed 678901" },
 *             { "term": "abcd" }]
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
 * @name TeeftRemoveLongTerms
 */
export default function TeeftRemoveLongTerms(data, feed, ctx) {
    if (ctx.isLast()) {
        return feed.close();
    }

    const docIn = data;

    const docOut = {
        ...docIn,
        terms: docIn.terms.filter(termIsNotLong),
    };
    feed.write(docOut);
    feed.end();
}
