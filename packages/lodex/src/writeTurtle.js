import { Store, Writer } from 'n3';
import defaultPrefixes from '../prefixes.json';

const aliasPrefixes = Object.keys(defaultPrefixes);
const uriPrefixes = Object.values(defaultPrefixes);

/**
 * Take quad or prefixes object and return turtle string.
 *
 * @example <caption>Input:</caption>
 * [{
 *    quad: {
 *      subject: { id: 'http://uri/janedoe' },
 *      predicate: { id: 'http://schema.org/jobTitle' },
 *      object: { id: '"Professor"' }
 *    }
 *  }, {
 *      quad: {
 *      subject: { id: 'http://uri/janedoe' },
 *      predicate: { id: 'http://schema.org/name' },
 *      object: { id: '"Jane Doe"' }
 *    }
 *  }, {
 *      quad: {
 *      subject: { id: 'http://uri/janedoe' },
 *      predicate: { id: 'http://schema.org/telephone' },
 *      object: { id: '"(425) 123-4567"' }
 *      }
 *  }, {
 *      quad: {
 *      subject: { id: 'http://uri/janedoe' },
 *      predicate: { id: 'http://schema.org/url' },
 *      object: { id: 'http://www.janedoe.com' }
 *      }
 *  }, {
 *      quad: {
 *      subject: { id: 'http://uri/janedoe' },
 *      predicate: { id: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' },
 *      object: { id: 'http://schema.org/Person' }
 *      }
 *  }, { prefixes: {} }
 *  ]
 *
 * @example <caption>Output:</caption>
 * '@prefix schema: <http://schema.org/>.\n'
 * '@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>.\n'
 * '\n'
 * '<http://uri/janedoe> schema:jobTitle "Professor";\n'
 * '    schema:name "Jane Doe";\n'
 * '    schema:telephone "(425) 123-4567";\n'
 * '    schema:url <http://www.janedoe.com>;\n'
 * '    a schema:Person.\n"'
 *
 * @export
 * @return {String} turtle
 * @name writeTurtle
 */
export default function writeTurtle(data, feed) {
    if (this.isLast()) {
        feed.close();
        return;
    }
    if (this.isFirst()) {
        this.store = new Store();
        this.prefixes = {};
    }
    if (data && data.quad) {
        const { quad } = data;
        const addPrefixWhenUsedInString = string => (prefixes, prefix, i) => (string.includes(prefix)
            ? { ...prefixes, [aliasPrefixes[i]]: prefix }
            : prefixes);

        const addPrefixWhenUsedInSubject = addPrefixWhenUsedInString(quad.subject.id);
        const addPrefixWhenUsedInPredicate = addPrefixWhenUsedInString(quad.predicate.id);
        const addPrefixWhenUsedInObject = addPrefixWhenUsedInString(quad.object.id);

        this.prefixes = uriPrefixes.reduce(addPrefixWhenUsedInSubject, this.prefixes);
        this.prefixes = uriPrefixes.reduce(addPrefixWhenUsedInPredicate, this.prefixes);
        this.prefixes = uriPrefixes.reduce(addPrefixWhenUsedInObject, this.prefixes);

        this.store.addQuad(quad);
    }
    if (data && data.prefixes) {
        this.writer = new Writer({
            prefixes: this.prefixes,
        });
        const quads = this.store.getQuads();
        this.writer.addQuads(quads);
        this.writer.end((error, result) => {
            if (error) {
                return feed.stop(new Error(error));
            }
            return feed.send(result);
        });
        this.store = null;
        this.writer = null;
    }
    feed.end();
}
