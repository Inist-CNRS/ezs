import { lte, pipe, prop } from 'ramda';

const getAlphaNumericRatio = (term) => term.replace(/[^a-zA-Z0-9]/g, '').length / term.length;

export const termIsNotWeird = pipe(
    prop('term'),
    getAlphaNumericRatio,
    lte(0.5)
);

/**
 * Remove terms with too much non-alphanumeric characters.
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
 *   "terms": [{ "term": "αβɣδ" }, { "term": "abcd" }]
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
 * @name TeeftRemoveWeirdTerms
 */
export default function TeeftRemoveWeirdTerms(data, feed, ctx) {
    if (ctx.isLast()) {
        return feed.close();
    }

    const docIn = data;

    const docOut = {
        ...docIn,
        terms: docIn.terms.filter(termIsNotWeird),
    };
    feed.write(docOut);
    feed.end();
}
