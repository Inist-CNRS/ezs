import { contains } from 'ramda';

let triples = [];
let previous = null;
let found = false;

function getTriple(line) {
    let [subject, verb, complement] = line.split('> ', 3);
    subject += '>';
    verb += '>';
    if (complement === '.\n') {
        // In the case of a verb badly parsed (ex: <uri1> a <uri2>)
        [verb, complement] = verb.split(' ', 2);
    } else if (!complement.endsWith('" .\n')) {
        // In the case of an URI, split removed the end of the complement
        complement += '>';
    } else /* if (complement.endsWith(' .\n')) */ {
        // In the normal case
        complement = complement.slice(0, -3); // Remove " .\n"
    }
    return [subject, verb, complement];
}

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
    if (this.isFirst()) {
        triples = [];
        previous = null;
        found = false;
    }

    const [subject, verb, complement] = getTriple(data);

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
 *
 * @example
 * <https://api.istex.fr/ark:/67375/QT4-D0J6VN6K-K> <https://data.istex.fr/ontology/istex#idIstex> "2FF3F5B1477986B9C617BB75CA3333DBEE99EB05" .
 * <https://api.istex.fr/ark:/67375/QT4-D0J6VN6K-K> a <http://purl.org/ontology/bibo/Document> .
 * <https://api.istex.fr/ark:/67375/QT4-D0J6VN6K-K> <host/genre> "journal" .
 * <https://api.istex.fr/ark:/67375/QT4-D0J6VN6K-K> <https://data.istex.fr/fake#journalTitle> "Linguistic Typology" .
 * <https://api.istex.fr/ark:/67375/QT4-D0J6VN6K-K> <https://data.istex.fr/fake#bookTitle> "Linguistic Typology" .
 * <https://api.istex.fr/ark:/67375/QT4-D0J6VN6K-K> <https://data.istex.fr/fake#seriesTitle> "Linguistic Typology" .
 *
 * @example
 * [ISTEXRemoveIf]
 * if = <host/genre> = "journal"
 * remove = <https://data.istex.fr/fake#bookTitle>
 * remove = <https://data.istex.fr/fake#seriesTitle>
 * remove = <host/genre>
 *
 * @example
 * <https://api.istex.fr/ark:/67375/QT4-D0J6VN6K-K> <https://data.istex.fr/ontology/istex#idIstex> "2FF3F5B1477986B9C617BB75CA3333DBEE99EB05" .
 * <https://api.istex.fr/ark:/67375/QT4-D0J6VN6K-K> a <http://purl.org/ontology/bibo/Document> .
 * <https://api.istex.fr/ark:/67375/QT4-D0J6VN6K-K> <https://data.istex.fr/fake#journalTitle> "Linguistic Typology" .
 */
export default {
    ISTEXRemoveIf,
};
