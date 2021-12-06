import {
    __, divide, map, max, pipe, prop, sum,
} from 'ramda';
import { getResource } from './stop-words';

// Cache for dictionnary weights
const dictionaryWeights = {};

let weights = {};

const isMulti = term => !term.tag;
const isMono = term => term.tag;

/**
 * Take documents (with a `path`, an array of `terms`, each term being an object
 * { term, frequency, length[, tag] })
 *
 * Process objects containing frequency, add a specificity to each object, and
 * remove all object with a specificity below average specificity (except when
 * `filter` is `false`).
 *
 * Can also sort the objects according to their specificity, when `sort` is
 * `true`.
 *
 * @export
 * @param {string} [weightedDictionary="Ress_Frantext"] name of the weigthed dictionary
 * @param {Boolean} [filter=true]   filter below average specificity
 * @param {Boolean} [sort=false]    sort objects according to their specificity
 * @returns
 */
export default async function TeeftSpecificity(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }

    // #region Functions
    const self = this;
    self.totalFrequencies = 0;
    self.maxSpecificity = 0;
    self.specificitySum = 0;

    function addSpecificity(oldTerm) {
        const { frequency, term } = oldTerm;
        const weight = weights[term] || 10 ** -5;
        const computeSpecificity = pipe(
            divide(__, self.totalFrequencies),
            divide(__, weight),
        );
        const specificity = computeSpecificity(frequency);

        self.maxSpecificity = max(self.maxSpecificity, specificity);
        return {
            ...oldTerm,
            specificity,
        };
    }

    function normalizeSpecificity(term) {
        const specificity = term.specificity / self.maxSpecificity;
        self.specificitySum += isMono(term) ? specificity : 0;
        return {
            ...term,
            specificity,
        };
    }

    const addNormalizedSpecificity = pipe(
        map(addSpecificity),
        map(normalizeSpecificity),
    );
    // #endregion Functions

    // Parameters
    const weightedDictionary = this.getParam('weightedDictionary', 'Ress_Frantext');
    const filter = this.getParam('filter', true);
    const sort = this.getParam('sort', false);

    if (this.isFirst()) {
        weights = {};
        if (weightedDictionary) {
            if (!dictionaryWeights[weightedDictionary]) {
                (await getResource(weightedDictionary))
                    .map(line => line.split('\t'))
                    .forEach(([term, weight]) => { weights[term] = weight; });
                dictionaryWeights[weightedDictionary] = { ...weights };
            } else {
                weights = dictionaryWeights[weightedDictionary];
            }
        }
    }
    const docIn = data;

    self.totalFrequencies = sum(docIn.terms.map(prop('frequency')));

    let terms = addNormalizedSpecificity(docIn.terms);

    if (filter) {
        // compute averageSpecificity only on monoTerms
        const averageSpecificity = self.specificitySum / terms.filter(isMono).length;
        terms = terms.filter(term => term.specificity >= averageSpecificity || isMulti(term));
    }

    if (sort) {
        terms = terms.sort((a, b) => b.specificity - a.specificity);
    }

    const docOut = {
        ...docIn,
        terms,
    };
    feed.write(docOut);
    feed.end();
}
