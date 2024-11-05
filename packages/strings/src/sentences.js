import { get } from 'lodash';

const UPPER_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const SENTENCE_INIT = '  ';
const SENTENCE_ENDING = '.?!';

/**
 * Segment sentences from `str` into an array
 * @param {string} str
 * @returns {string[]}
 * @private
 */
const segmentSentences = (str) => {
    const characters = Array.from(str);
    const sentences = characters
        .reduce(
            /**
             * @param {string[]} prevSentences
             * @param {string} character
             * @return {string[]}
             * @private
             */
            (prevSentences, character) => {
                const currentSentence = prevSentences.slice(-1)[0];
                const [char1, char2] = currentSentence.slice(-2);
                if (SENTENCE_ENDING.includes(character)) {
                    if (character !== '.') {
                        return [
                            ...prevSentences.slice(0, -1),
                            currentSentence + character,
                            SENTENCE_INIT,
                        ];
                    }
                    if (char1 !== ' ') {
                        return [
                            ...prevSentences.slice(0, -1),
                            currentSentence + character,
                            SENTENCE_INIT,
                        ];
                    }
                    if (!UPPER_LETTERS.includes(char2)) {
                        return [
                            ...prevSentences.slice(0, -1),
                            currentSentence + character,
                            SENTENCE_INIT,
                        ];
                    }
                }
                return [
                    ...prevSentences.slice(0, -1),
                    currentSentence + character,
                ];
            },
            [SENTENCE_INIT]
        )
        .filter((sentence) => sentence !== SENTENCE_INIT)
        .map((sentence) => sentence.trimStart());
    return sentences;
};

const sentencesStatement = (data, feed, ctx) => {
    if (ctx.isLast()) {
        return feed.close();
    }
    const path = ctx.getParam('path', '');
    const value = path ? get(data, path) : data;
    const str = Array.isArray(value)
        ? value.map((item) => (typeof item === 'string' ? item : '')).join(' ')
        : value;
    const sentences = str ? segmentSentences(str) : [];

    feed.write(path ? { ...data, [path]: sentences }: sentences);
    return feed.end();
};

/**
 * Take a `String` and split it into an array of sentences.
 *
 * Input:
 *
 * ```json
 * { "id": 1, "value": "First sentence? Second sentence. My name is Bond, J. Bond." }
 * ```
 *
 * Output:
 *
 * ```json
 * { "id": 1, "value": ["First sentence?", "Second sentence.", "My name is Bond, J. Bond."] }
 * ```
 *
 * > 📗 When the path is not given, the input data is considered as a string,
 * > allowing to apply `inflection` on a string stream.
 *
 * @name sentences
 * @param {string} [path=""] path of the field to segment
 * @returns {string[]}
 */
export default {
    sentences: sentencesStatement,
};
