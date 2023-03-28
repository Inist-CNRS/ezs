import { StringDecoder } from 'string_decoder';

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
    const sentences = characters.reduce(
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
                    return [...prevSentences.slice(0, -1), currentSentence + character, SENTENCE_INIT];
                }
                if (char1 !== ' ') {
                    return [...prevSentences.slice(0, -1), currentSentence + character, SENTENCE_INIT];
                }
                if (!UPPER_LETTERS.includes(char2)) {
                    return [...prevSentences.slice(0, -1), currentSentence + character, SENTENCE_INIT];
                }
            }
            return [...prevSentences.slice(0, -1), currentSentence + character];
        }
        , [SENTENCE_INIT])
        .map(sentence => sentence.trimStart());
    return sentences;
};

const TXTSentences = (data, feed, ctx) => {
    if (!ctx.decoder) {
        ctx.decoder = new StringDecoder('utf8');
    }
    if (ctx.isLast()) {
        ctx.decoder.end();
        return feed.end();
    }

    ctx.remainder = ctx.remainder ?? '';

    let str;
    if (Buffer.isBuffer(data)) {
        str = ctx.decoder.write(data);
    } else if (typeof data === 'string') {
        str = data;
    }
    const lines = str ? segmentSentences(str) : [];

    lines.unshift(ctx.remainder + lines.shift());
    ctx.remainder = lines.pop();
    lines.forEach((line) => {
        feed.write(line);
    });
    return feed.end();
};

/**
 * Take a `String` and split it into an array of sentences.
 *
 * Input:
 *
 * ```json
 * "First sentence? Second sentence. My name is Bond, J. Bond."
 * ```
 *
 * Output:
 *
 * ```json
 * ["First sentence?", "Second sentence.", "My name is Bond, J. Bond."]
 * ```
 *
 * @name TXTSentences
 * @returns {String}
 */
export default {
    TXTSentences,
};
