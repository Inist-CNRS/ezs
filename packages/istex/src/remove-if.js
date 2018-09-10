import { contains } from 'ramda';

let triples = [];
let previous = null;
let found = false;

function ISTEXRemoveIf(data, feed) {
    const [property, value] = this.getParam('if', ' = ').split(' = ');
    const toRemove = this.getParam('remove', []);
    function writeFilteredTriples() {
        if (found) {
            triples = triples.filter(triple => !contains(triple.verb, toRemove));
        }
        triples.forEach(t => feed.write(`${t.subject} ${t.verb} ${t.complement} .\n`));
    }

    if (this.isLast()) {
        writeFilteredTriples();
        return feed.close();
    }

    let [subject, verb, complement] = data.split('> ', 3);
    subject += '>';
    verb += '>';
    complement = complement.slice(0, -3); // Remove " .\n"

    if (previous && subject !== previous) {
        writeFilteredTriples();
        triples = [];
        previous = subject;
        found = false;
    }
    triples.push({ subject, verb, complement });
    found = found || (verb === property && complement === value);
    feed.end();
}

/**
 * Remove triples which properties are given (`remove`) if other given `property`
 * has the given `value`.
 *
 * @param {string} if   "property = value"
 * @param {Array<string></string>} remove    list of properties to remove
 */
export default {
    ISTEXRemoveIf,
};
