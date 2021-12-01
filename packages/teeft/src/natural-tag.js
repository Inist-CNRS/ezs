import readFilePromise from 'fs-readfile-promise';
import { Lexicon, RuleSet, BrillPOSTagger } from 'natural';

const getTagger = async () => {
    const baseFolder = `${__dirname}/..`;
    const lexiconFilename = `${baseFolder}/resources/tagging_wiki08.txt`;
    const defaultCategory = 'UNK';

    const lexiconContent = await readFilePromise(lexiconFilename, 'utf8');

    const lexicon = new Lexicon('FR', defaultCategory);
    // FR language is not present in natural
    lexicon.parseLexicon(lexiconContent);
    // Maybe using a trained RuleSet could improve tagging?
    const rules = new RuleSet();
    const tagger = new BrillPOSTagger(lexicon, rules);
    return tagger;
};

let tagger;

const tokens2taggedWords = (tokens) => {
    const { taggedWords } = tagger.tag(tokens);
    return taggedWords;
};

const toCommonStruct = taggedWords => taggedWords
    .map(taggedWord => ({
        token: taggedWord.token,
        tag: [taggedWord.tag],
    }));

/**
 * POS Tagger from natural
 *
 * French pos tagging using natural (and LEFFF resources)
 *
 * Take an array of documents (objects: { path, sentences: [[]] })
 *
 * Yield an array of documents (objects: {
 *      path, sentences: [
 *          [{
 *              token: "token",
 *              tag: [ "tag", ... ]
 *          },
 *          ...]
 *      ]
 * })
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
 */
export default async function TeeftNaturalTag(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    if (this.isFirst()) {
        tagger = tagger || await getTagger();
    }

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
