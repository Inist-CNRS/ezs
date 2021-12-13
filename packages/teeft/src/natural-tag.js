import readFilePromise from 'fs-readfile-promise';
import { Lexicon, RuleSet, BrillPOSTagger } from 'natural';

const languageTagger = {};

/**
 * @private
 * @param {string} lang language of the text to tag
 * @returns
 */
const getTagger = async (lang) => {
    if (languageTagger[lang]) return languageTagger[lang];
    let tagger;
    if (lang === 'fr') {
        const baseFolder = `${__dirname}/..`;
        const defaultCategory = 'UNK';
        const lexiconFilename = `${baseFolder}/resources/tagging_wiki08.txt`;

        const lexiconContent = await readFilePromise(lexiconFilename, 'utf8');

        const lexicon = new Lexicon('FR', defaultCategory);
        // FR language is not present in natural
        lexicon.parseLexicon(lexiconContent);
        // Maybe using a trained RuleSet could improve tagging?
        const rules = new RuleSet();
        tagger = new BrillPOSTagger(lexicon, rules);
    }
    if (lang === 'en') {
        const defaultCategory = 'NN';
        const lexicon = new Lexicon('EN', defaultCategory);
        const rules = new RuleSet('EN');
        tagger = new BrillPOSTagger(lexicon, rules);
    }
    languageTagger[lang] = tagger;
    return tagger;
};

/**
 * POS Tagger from natural
 *
 * French pos tagging using natural (and LEFFF resources)
 *
 * Take an array of documents (objects: `{ path, sentences: [[]] })`
 *
 * Yield an array of documents (objects:
 *
 * ```
 * {
 *      path, sentences: [
 *          [{
 *              token: "token",
 *              tag: [ "tag", ... ]
 *          },
 *          ...]
 *      ]
 * }
 * ```
 * )
 *
 * @example
 *  [{
 *      path: "/path/1",
 *      sentences: [{ "token": "dans",      "tag": ["prep"] },
 *                  { "token": "le",        "tag": ["det"]  },
 *                  { "token": "cadre",     "tag": ["nc"] },
 *                  { "token": "du",        "tag": ["det"] },
 *                  { "token": "programme", "tag": ["nc"] }
 *                  },
 *      ]
 *  }]
 *
 * @export
 * @param {string} [lang='en']  language of the text to tag (possible values: `fr`, `en`)
 * @name TeeftNaturalTag
 */
export default async function TeeftNaturalTag(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const lang = this.getParam('lang', 'en');
    const self = this;

    if (this.isFirst()) {
        self.tagger = await getTagger(lang);
    }

    // #region Functions
    const tokens2taggedWords = (tokens) => {
        const { taggedWords } = self.tagger.tag(tokens);
        return taggedWords;
    };

    const toCommonStruct = taggedWords => taggedWords
        .map(taggedWord => ({
            token: taggedWord.token,
            tag: [taggedWord.tag],
        }));
    // #endregion Functions

    const docIn = data;

    const docOut = {
        path: docIn.path,
        sentences: docIn.sentences
            .map(tokens2taggedWords)
            .map(toCommonStruct),
    };
    feed.write(docOut);
    feed.end();
}
