import zipObject from 'lodash.zipobject';
import escapeRegExp from 'lodash.escaperegexp';
import mapKeys from 'lodash.mapkeys';
import mapValues from 'lodash.mapvalues';

/**
 * Take `Object` and throw the same object, all keys parsed to replace namespaces with their prefixes
 *
 * > **Note:**  You can also parse values for specific keys (keys containing references to other keys)
 *
 * ```json
 * [
 *   {
 *    "http://purl.org/dc/terms/title": "Life is good",
 *    "http://purl.org/ontology/places#Countryl": "France",
 *  },
 *  {
 *    "http://purl.org/dc/terms/title": "The rising sun",
 *    "http://purl.org/ontology/places#Country": "Japan",
 *  },
 *  {
 *    "http://purl.org/dc/terms/title": "Dolce Vista",
 *    "http://purl.org/ontology/places#Country": "Italy",
 *  }
 * ]
 * ```
 *
 * Script:
 *
 * ```ini
 * [use]
 * plugin = basics
 *
 * [OBJNamespaces]
 * prefix = dc:
 * namespace = http://purl.org/dc/terms/
 *
 * prefix = place:
 * namespace = http://purl.org/ontology/places#
 *
 * ```
 *
 * Output:
 *
 * ```json
 * [
 *  {
 *    "dc:title": "Life is good",
 *    "place:Country": "France",
 *  },
 *  {
 *    "dc:title": "The rising sun",
 *    "place:Country": "Japan",
 *  },
 *  {
 *    "dc:title": "Dolce Vista",
 *    "place:Country": "Italy",
 *  }
 * ]
 * ```
 *
 * @name OBJNamespaces
 * @param {String} [prefix] the alias for a namespace
 * @param {String} [namespace] the namespace to substitute by a prefix
 * @param {String} [reference=null] a regex to find key that contains a namespace to substitute
 * @returns {Object}
 */
export default function OBJNamespaces(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    if (this.isFirst()) {
        const prefixes = []
            .concat(this.getParam('prefix'))
            .map((x) => String(x).trim())
            .filter(Boolean);
        const namespaces = []
            .concat(this.getParam('namespace'))
            .filter(Boolean)
            .slice(0, prefixes.length)
            .map((x) => String(x).trim());
        this.mapping = zipObject(namespaces, prefixes);
        this.expression = RegExp(
            Object.keys(this.mapping).map(escapeRegExp).join('|'),
            'g',
        );
        this.references = []
            .concat(this.getParam('reference'))
            .filter(Boolean)
            .map((x) => RegExp(String(x).trim(), 'g'));
    }
    const result = mapKeys(data, (val, key) =>
        String(key).replace(
            this.expression,
            (matched) => this.mapping[matched],
        ),
    );
    if (this.references.length > 0) {
        const result1 = mapValues(result, (value, key) => {
            if (this.references.some((x) => key.search(x) !== -1)) {
                return String(value).replace(
                    this.expression,
                    (matched) => this.mapping[matched],
                );
            }
            return value;
        });
        return feed.send(result1);
    }
    return feed.send(result);
}
