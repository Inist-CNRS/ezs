/*
 * Check that a `text` begins with any of the `tags`.
 *
 * @param {Array<string>} tags
 * @param {string} text
 * @returns {Boolean}
 */
export function beginsWith(tags, text) {
    return tags.some(tag => text.startsWith(tag));
}

/*
 * Check if some of the `texts` begins with any of the `tags`.
 *
 * Returns true if texts is not defined (when a term is not tagged, for example
 * a multiterm)
 *
 * @param {Array<string>} tags
 * @param {Array<string>} texts
 * @returns {Boolean}
 */
export function someBeginsWith(tags, texts) {
    if (!texts) return true;
    if (!texts.length) return true;
    return texts.some(text => beginsWith(tags, text));
}

/**
 * Filter the text in input, by keeping only adjectives and names
 *
 * @export
 * @param {string} [tags=['ADJ', 'NOM']]  Tags to keep
 */
export default function TeeftFilterTags(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const tagsToKeep = this.getParam('tags', ['ADJ', 'NOM']);

    const docIn = data;
    const dataArray = docIn.terms;
    const newTerms = dataArray
        .filter(w => someBeginsWith(tagsToKeep, w.tag));
    const docOut = {
        ...docIn,
        terms: newTerms
    };
    feed.write(docOut);
    feed.end();
}
