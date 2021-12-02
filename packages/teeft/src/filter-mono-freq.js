import { both, either, filter } from 'ramda';

/**
 * Filter the `data`, keeping only multiterms and frequent monoterms.
 *
 * @export
 * @param {Number}  [multiLimit=2]  threshold for being a multiterm (in tokens number)
 * @param {Number}  [minFrequency=7]    minimal frequency to be taken as a frequent term
 */
export default function TeeftFilterMonoFreq(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const multiLimit = this.getParam('multiLimit', 2);
    const minFrequency = this.getParam('minFrequency', 7);

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
