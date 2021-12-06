import { pipe, prop, replace } from 'ramda';

export const termIsNotNumber = pipe(
    prop('term'),
    replace(',', '.'),
    Number,
    Number.isNaN
);

/**
 * Remove numbers from the terms of documents (objects { path, terms: [{ term, ...}] }).
 *
 * Yields an array of documents with the same structure.
 *
 * @export
 * @name TeeftRemoveNumbers
 */
export default function TeeftRemoveNumbers(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }

    const docIn = data;

    const docOut = {
        path: docIn.path,
        terms: docIn.terms.filter(termIsNotNumber),
    };
    feed.write(docOut);
    feed.end();
}
