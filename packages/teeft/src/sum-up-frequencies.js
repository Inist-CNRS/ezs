import { mapObjIndexed, merge, values } from 'ramda';

const reinitDocumentAggregations = (obj) => {
    obj.lemmaFrequency = {};
    obj.terms = {};
};

/**
 * Sums up the frequencies of identical lemmas from different chunks.
 *
 * @export
 * @name TeeftSumUpFrequencies
 */
export default function TeeftSumUpFrequencies(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const self = this;
    if (this.isFirst()) {
        reinitDocumentAggregations(self);
    }
    const docIn = data;
    const { terms: termsList } = docIn;
    termsList
        .forEach((term) => {
            const key = term.lemma || term.term;
            self.lemmaFrequency[key] = (self.lemmaFrequency[key] || 0) + term.frequency;
            self.terms[key] = term;
        });
    const newTerms = mapObjIndexed((frequency, lemma) => {
        const term = self.terms[lemma];
        const newTerm = merge(term, { frequency });
        return newTerm;
    }, self.lemmaFrequency);
    feed.write({
        ...docIn,
        terms: values(newTerms),
    });
    reinitDocumentAggregations(self);
    feed.end();
}
