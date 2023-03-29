import get from 'lodash.get';

const UPPER_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const SENTENCE_INIT = '  ';
const SENTENCE_ENDING = '.?!';

/*
 * Segment sentences from `str` into an array
 * @param {string} str
 * @returns {string[]}
 */
const segmentSentences = (str) => {
    const characters = str.split('');
    const sentences = characters
        .reduce(
            /*
             * @param {string[]} prevSentences
             * @param {string} character
             * @return {string[]}
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
        .filter(sentence => sentence !== SENTENCE_INIT)
        .map((sentence) => sentence.trimStart());
    return sentences;
};

const TXTSentences = (data, feed, ctx) => {
    if (ctx.isLast()) {
        return feed.close();
    }
    const path = ctx.getParam('path', 'value');
    const value = get(data, path);

    let str;
    if (typeof value === 'string') {
        str = value;
    }
    const sentences = str ? segmentSentences(str) : [];

    feed.write({ ...data, [path]: sentences });
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
 * @name TXTSentences
 * @param {String} [path="value"] path of the field to segment
 * @returns {String}
 */
export default {
    TXTSentences,
};
