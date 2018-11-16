import { contains } from 'ramda';
import { getTriple } from './utils';

const triples = {};
const previous = {};

function ISTEXRemoveVerb(data, feed) {
    const verbToRemove = this.getParam('verb', '');
    function writeFilteredTriples() {
        triples[verbToRemove] = triples[verbToRemove]
            .filter(triple => !contains(triple.verb, verbToRemove));
        triples[verbToRemove].forEach(
            t => feed.write(`${t.subject} ${t.verb} ${t.complement} .\n`),
        );
    }

    if (this.isLast()) {
        writeFilteredTriples();
        return feed.close();
    }

    const [subject, verb, complement] = getTriple(data);

    if (this.isFirst()) {
        triples[verbToRemove] = [];
        previous[verbToRemove] = subject;
    }

    if (previous[verbToRemove] && subject !== previous[verbToRemove]) {
        writeFilteredTriples();
        triples[verbToRemove] = [];
        previous[verbToRemove] = subject;
    }

    triples[verbToRemove].push({ subject, verb, complement });
    feed.end();
}

/**
 * Unconditionnaly remove triples which `verb` is given.
 *
 * @name ISTEXRemoveVerb
 * @param {string} verb   `"<https://data.istex.fr/ontology/istex#idIstex>"`
 *
 * @example
 * <https://api.istex.fr/ark:/67375/QT4-D0J6VN6K-K> <https://data.istex.fr/ontology/istex#idIstex> "2FF3F5B1477986B9C617BB75CA3333DBEE99EB05" .
 * <https://api.istex.fr/ark:/67375/QT4-D0J6VN6K-K> a <http://purl.org/ontology/bibo/Document> .
 * <https://api.istex.fr/ark:/67375/QT4-D0J6VN6K-K> <host/genre> "journal" .
 * <https://api.istex.fr/ark:/67375/QT4-D0J6VN6K-K> <https://data.istex.fr/fake#journalTitle> "Linguistic Typology" .
 *
 * @example
 * [ISTEXRemoveIf]
 * verb = <host/genre>
 *
 * @example
 * <https://api.istex.fr/ark:/67375/QT4-D0J6VN6K-K> <https://data.istex.fr/ontology/istex#idIstex> "2FF3F5B1477986B9C617BB75CA3333DBEE99EB05" .
 * <https://api.istex.fr/ark:/67375/QT4-D0J6VN6K-K> a <http://purl.org/ontology/bibo/Document> .
 * <https://api.istex.fr/ark:/67375/QT4-D0J6VN6K-K> <https://data.istex.fr/fake#journalTitle> "Linguistic Typology" .
 */
export default {
    ISTEXRemoveVerb,
};
