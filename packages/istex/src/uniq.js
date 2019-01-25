import { equals } from 'ramda';
import { getSubject } from './utils';

let triples;
let previous;

function getLiteral(beg, end, s) {
    return s.substring(beg + 1, end);
}

function locateLiteral(s) {
    const beg = s.indexOf('"');
    const end = s.indexOf('"', s.length - 4);
    return { beg, end };
}

function endsWithLiteral(beg, end) {
    return (beg !== -1 && end > beg);
}

function ISTEXUniq(data, feed) {
    function writeFilteredTriples() {
        triples.reduce((alreadySeen, t) => {
            if (!alreadySeen.find(equals(t))) {
                const { beg, end } = locateLiteral(t);
                if (endsWithLiteral(beg, end)) {
                    const literal = getLiteral(beg, end, t);
                    const triple = `${t.substring(0, beg)}${JSON.stringify(literal)} .\n`;
                    feed.write(triple);
                } else {
                    feed.write(t);
                }
            }
            alreadySeen.push(t);
            return alreadySeen;
        }, []);
    }

    if (this.isLast()) {
        writeFilteredTriples();
        return feed.close();
    }

    const subject = getSubject(data);

    if (this.isFirst()) {
        triples = [];
        previous = subject;
    }

    if (previous && subject !== previous) {
        writeFilteredTriples();
        triples = [];
        previous = subject;
    }

    let triple = data;
    if (!triple.endsWith('\n')) {
        triple += '\n';
    }
    triples.push(triple);
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
