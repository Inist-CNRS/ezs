import path from 'path';
import fsReadFilePromise from 'fs-readfile-promise';

export async function getResource(fileName) {
    if (!fileName) return [];
    const filePath = path.resolve(__dirname, `../resources/${fileName}.txt`);
    let text;
    try {
        text = await fsReadFilePromise(filePath, { encoding: 'utf-8' } );
    } catch(err) {
        return [];
    }
    return text.split('\n');
}

/**
 * Filter the text in input, by removing stopwords in token
 *
 * @export
 * @param {string} [stopwords='StopwFrench']    name of the stopwords file to use
 * @name TeeftStopWords
 */
export default async function TeeftStopWords(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    let stopWords;
    if (this.isFirst()) {
        const stopWordsFile = this.getParam('stopwords', 'StopwFrench');
        stopWords = await getResource(stopWordsFile);
    }

    const docIn = data;

    const isNotStopWord = w => !stopWords.includes(w.term && w.term.toLowerCase());

    const removeStopWordsFromDocument = ((document) => {
        const { terms } = document;
        return {
            ...document,
            terms: terms.filter(isNotStopWord),
        };
    });
    const docOut = removeStopWordsFromDocument(docIn);
    feed.write(docOut);
    feed.end();
}
