import { equals } from 'ramda';
import { getTriple } from './utils';

let triples;
let previous;

function ISTEXUniq(data, feed) {
    function writeFilteredTriples() {
        triples.reduce((alreadySeen, t) => {
            if (!alreadySeen.find(equals(t))) {
                feed.write(`${t.subject} ${t.verb} ${t.complement} .\n`);
            }
            alreadySeen.push(t);
            return alreadySeen;
        }, []);
    }

    if (this.isLast()) {
        writeFilteredTriples();
        return feed.close();
    }

    const [subject, verb, complement] = getTriple(data);

    if (this.isFirst()) {
        triples = [];
        previous = subject;
    }

    if (previous && subject !== previous) {
        writeFilteredTriples();
        triples = [];
        previous = subject;
    }

    triples.push({ subject, verb, complement });
    feed.end();
}

/**
 * Remove duplicates triples within a single document's set of triples (same
 * subject).
 *
 * Assume that every triple of a document (except the first one) follows another
 * triple of the same document.
 *
 * @name ISTEXUniq
 *
 * @example
 * <https://api.istex.fr/ark:/67375/NVC-JMPZTKTT-R> <http://purl.org/dc/terms/creator> "S Corbett" .
 * <https://api.istex.fr/ark:/67375/NVC-JMPZTKTT-R> <https://data.istex.fr/ontology/istex#affiliation> "Department of Public Health, University of Sydney, Australia." .
 * <https://api.istex.fr/ark:/67375/NVC-JMPZTKTT-R> <https://data.istex.fr/ontology/istex#affiliation> "Department of Public Health, University of Sydney, Australia." .
 * <https://api.istex.fr/ark:/67375/NVC-JMPZTKTT-R> <https://data.istex.fr/ontology/istex#affiliation> "Department of Public Health, University of Sydney, Australia." .
 *
 * @example
 * [ISTEXUniq]
 *
 * @example
 * <https://api.istex.fr/ark:/67375/NVC-JMPZTKTT-R> <http://purl.org/dc/terms/creator> "S Corbett" .
 * <https://api.istex.fr/ark:/67375/NVC-JMPZTKTT-R> <https://data.istex.fr/ontology/istex#affiliation> "Department of Public Health, University of Sydney, Australia." .
 */
export default {
    ISTEXUniq,
};
