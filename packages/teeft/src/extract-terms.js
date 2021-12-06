import R from 'ramda';
import { someBeginsWith } from './filter-tags';

const SEARCH = Symbol('SEARCH');
const NOUN = Symbol('NOUN');

export function reinitSequenceFrequency(obj) {
    obj.termFrequency = {};
    obj.termSequence = [];
}

export function extractSentenceTerms(taggedTerms,
    obj,
    nounTag = 'NOM',
    adjTag = 'ADJ',
    isNoun = R.curry(someBeginsWith)([nounTag]),
    isAdj = R.curry(someBeginsWith)([adjTag])) {
    let multiterm = [];
    let state = SEARCH;
    taggedTerms
        .forEach((taggedTerm) => {
            const tags = taggedTerm.tag;
            const norm = taggedTerm.token;
            if (state === SEARCH && (isNoun(tags) || isAdj(tags))) {
                state = NOUN;
                multiterm.push(norm);
                obj.termSequence.push(norm);
                obj.termFrequency[norm] = (obj.termFrequency[norm] || 0) + 1;
            } else if (state === NOUN && (isNoun(tags) || isAdj(tags))) {
                multiterm.push(norm);
                obj.termSequence.push(norm);
                obj.termFrequency[norm] = (obj.termFrequency[norm] || 0) + 1;
            } else if (state === NOUN && !isNoun(tags) && !isAdj(tags)) {
                state = SEARCH;
                if (multiterm.length > 1) {
                    const word = multiterm.join(' ');
                    obj.termSequence.push(word);
                    obj.termFrequency[word] = (obj.termFrequency[word] || 0) + 1;
                }
                multiterm = [];
                obj.termSequence.push(norm);
                obj.termFrequency[norm] = (obj.termFrequency[norm] || 0) + 1;
            } else {
                obj.termSequence.push(norm);
                obj.termFrequency[norm] = (obj.termFrequency[norm] || 0) + 1;
            }
        });
    // If a multiterm was in progress, we save it
    if (multiterm.length > 1) {
        const word = multiterm.join(' ');
        obj.termSequence.push(word);
        obj.termFrequency[word] = (obj.termFrequency[word] || 0) + 1;
    }
    obj.termSequence = R.uniq(obj.termSequence);
    return { termSequence: obj.termSequence, termFrequency: obj.termFrequency };
}

/**
 * Take an array of objects `{ path, sentences: [token, tag: ["tag"]]}`.
 * Regroup multi-terms when possible (noun + noun, adjective + noun, *etc*.),
 * and computes statistics (frequency, *etc*.).
 *
 * @example
 * [{
 *    path: '/path/1',
 *    sentences:
 *    [[
 *      { token: 'elle', tag: ['PRO:per'] },
 *      { token: 'semble', tag: ['VER'] },
 *      { token: 'se', tag: ['PRO:per'] },
 *      { token: 'nourrir', tag: ['VER'] },
 *      {
 *        token: 'essentiellement',
 *        tag: ['ADV'],
 *      },
 *      { token: 'de', tag: ['PRE', 'ART:def'] },
 *      { token: 'plancton', tag: ['NOM'] },
 *      { token: 'frais', tag: ['ADJ'] },
 *      { token: 'et', tag: ['CON'] },
 *      { token: 'de', tag: ['PRE', 'ART:def'] },
 *      { token: 'hotdog', tag: ['UNK'] }
 *    ]]
 * }]
 *
 * @see https://github.com/istex/sisyphe/blob/master/src/worker/teeft/lib/termextractor.js
 * @export
 * @param {string}  [nounTag='NOM']  noun tag
 * @param {string}  [adjTag='ADJ']   adjective tag
 * @returns same as input, with `term` replacing `token`, `length`, and `frequency`
 * @name TeeftExtractTerms
 */
export default function TeeftExtractTerms(data, feed) {
    const self = this;
    if (this.isLast()) {
        return feed.close();
    }
    if (this.isFirst()) {
        self.termFrequency = {};
        self.termSequence = [];
    }
    const nounTag = this.getParam('nounTag', 'NOM');
    const adjTag = this.getParam('adjTag', 'ADJ');
    const docIn = data;

    function extractFromDocument(document) {
        reinitSequenceFrequency(self);
        let taggedTerms = [];
        const { sentences } = document;
        sentences.forEach((sentence) => {
            const sentenceTaggedTerms = R.clone(sentence)
                .map(term => ({ ...term, tag: Array.isArray(term.tag) ? term.tag : [term.tag] }));
            extractSentenceTerms(sentenceTaggedTerms, self, nounTag, adjTag);
            taggedTerms = taggedTerms.concat(sentenceTaggedTerms);
        });

        // Compute `length` (number of words) and frequency
        // @param termSequence
        const computeLengthFrequency = R.reduce((acc, word) => {
            acc[word] = {
                frequency: self.termFrequency[word],
                length: word.split(' ').length,
            };
            return acc;
        }, {});

        // Merge taggedTerms and value (length and frequency) of words (output of
        // computeLengthFrequency)
        const mergeTagsAndFrequency = (lengthFreq, token) => R.merge(
            { ...lengthFreq, token },
            R.find(taggedTerm => taggedTerm.token === token, taggedTerms),
        );

        // Rename `token` property to `term`
        const moveTokenToTerm = R.pipe(
            taggedToken => ({ ...taggedToken, term: taggedToken.token }),
            R.dissoc('token'),
        );

        // Add tags to terms
        const addTags = R.mapObjIndexed(mergeTagsAndFrequency);
        // NOTE: FilterTag is applied *after* TermExtractor

        const terms = R.pipe(computeLengthFrequency, addTags, R.values)(self.termSequence);
        const doc = {
            ...document,
            terms: terms.map(moveTokenToTerm),
        };
        const result = R.dissoc('sentences', doc);

        return result;
    }

    const docOut = extractFromDocument(docIn);

    feed.write(docOut);
    feed.end();
}
