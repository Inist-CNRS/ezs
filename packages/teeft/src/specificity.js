import {
    __, divide, map, max, pipe, prop, sum,
} from 'ramda';
import { getResource } from './stop-words';

// Cache for dictionnary weights
const dictionaryWeights = {};

// NOTE: for all these variables, it should be better to place them within the
// scope of the main function.
// The same for the following functions (addSpecificity, normalizeSpecificity,
// addNormalizedSpecificity), to use its closure, but they would increase the
// main function's size.
let totalFrequencies;
let weights = {};
let maxSpecificity;
let specificitySum;

function initialize() {
    totalFrequencies = 0;
    maxSpecificity = 0;
    specificitySum = 0;
}

const isMulti = term => !term.tag;
const isMono = term => term.tag;

function addSpecificity(oldTerm) {
    const { frequency, term } = oldTerm;
    const weight = weights[term] || 10 ** -5;
    const computeSpecificity = pipe(
        divide(__, totalFrequencies),
        divide(__, weight),
    );
    const specificity = computeSpecificity(frequency);

    maxSpecificity = max(maxSpecificity, specificity);
    return {
        ...oldTerm,
        specificity,
    };
}

function normalizeSpecificity(token) {
    const specificity = token.specificity / maxSpecificity;
    specificitySum += isMono(token) ? specificity : 0;
    return {
        ...token,
        specificity,
    };
}

const addNormalizedSpecificity = pipe(
    map(addSpecificity),
    map(normalizeSpecificity),
);

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
    const weightedDictionary = this.getParam('weightedDictionary', 'Ress_Frantext');
    const filter = this.getParam('filter', true);
    const sort = this.getParam('sort', false);
    if (this.isLast()) {
        return feed.close();
    }
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
    initialize();

    totalFrequencies = sum(docIn.terms.map(prop('frequency')));

    let terms = addNormalizedSpecificity(docIn.terms);

    if (filter) {
        // compute averageSpecificity only on monoTerms
        const averageSpecificity = specificitySum / terms.filter(isMono).length;
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
