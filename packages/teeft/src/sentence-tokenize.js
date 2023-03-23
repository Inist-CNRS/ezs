const sentencesCutter = (input) => {
    if (!input || input.trim() === '') {
        return [];
    }
    const regex = /(["'‘“'"[({⟨]([A-Z]\.)?[^.?!]+[.?!]["'’”'"\])}⟩]|([A-Z]\.)?[^.?!]+[.?!\s]+)\s?/g;
    const tokens = input.match(regex);

    if (!tokens) {
        return [input];
    }

    // remove unnecessary white space
    return tokens.filter(Boolean).map(s => s.trim());
};

/**
 * Segment the data into an array of documents (objects `{ path, content }`).
 *
 * Yield an array of documents (objects `{ path, sentences: []}`)
 *
 * @export
 * @name TeeftSentenceTokenize
 */
export default function TeeftSentenceTokenize(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const docIn = data;
    const docOut = {
        path: docIn.path,
        sentences: sentencesCutter(docIn.content),
    };
    feed.write(docOut);
    feed.end();
}
