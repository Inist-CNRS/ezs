import { both, either, filter } from 'ramda';

const computeDocFrequencyThreshold = nbTokens => 0.9786 * nbTokens ** 0.2911;

/**
 * Filter the `data`, keeping only multiterms and frequent monoterms.
 *
 * Minimal frequency (`minFrequency` parameter) has a default value
 * automatically computed from the number of tokens in the document.
 *
 * @export
 * @param {Number} [multiLimit=2]   threshold for being a multiterm (in tokens
 * number)
 * @param {Number} [minFrequency=7] minimal frequency to be taken as a
 * frequent term
 * @name TeeftFilterMonoFreq
 */
export default function TeeftFilterMonoFreq(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const multiLimit = this.getParam('multiLimit', 2);
    const nbTokens = data.terms.length;
    const minFrequency = this.getParam('minFrequency', computeDocFrequencyThreshold(nbTokens));

    const isMonoTerm = term => term.length < multiLimit;
    const isFrequent = term => term.frequency >= minFrequency;
    const isMultiTerm = term => term.length >= multiLimit;

    const isFrequentMonoTerm = both(isMonoTerm, isFrequent);
    const isMultiOrFrequent = either(isFrequentMonoTerm, isMultiTerm);

    const filterMultiFrequency = filter(isMultiOrFrequent);

    const docIn = data;
    const { terms } = docIn;
    const filteredTerms = filterMultiFrequency(terms);
    const docOut = {
        ...docIn,
        terms: filteredTerms,
    };
    feed.write(docOut);
    feed.end();
}
