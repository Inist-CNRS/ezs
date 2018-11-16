/**
 * Take `Object` containing flatten hits from ISTEXResult.
 *
 * If the environment variable DEBUG is set, some errors could appear on stderr.
 *
 * @see ISTEXResult
 * @see OBJFlatten (from ezs-basics)
 *
 * @example
 *
 * data: {
 * 'author/0/name': 'Geoffrey Strickland',
 * 'author/0/affiliations/0': 'University of Reading',
 * 'host/issn/0': '0047-2441',
 * 'host/eissn/0': '1740-2379',
 * 'title': 'Maupassant, Zola, Jules Vallès and the Paris Commune of 1871',
 * 'publicationDate': '1983',
 * 'doi/0': '10.1177/004724418301305203',
 * 'id': 'F6CB7249E90BD96D5F7E3C4E80CC1C3FEE4FF483',
 * 'score': 1 }
 *
 * @example
 *
 * .pipe(ezs('ISTEXTriplify', {
 *    property: [
 *      'doi/0 -> http://purl.org/ontology/bibo/doi',
 *      'language -> http://purl.org/dc/terms/language',
 *      'author/\\d+/name -> http://purl.org/dc/terms/creator',
 *      'author/\\d+/affiliations -> https://data.istex.fr/ontology/istex#affiliation',
 *    ],
 *  ));
 *
 * @example
 *
 *  <https://data.istex.fr/document/F6CB7249E90BD96D5F7E3C4E80CC1C3FEE4FF483>
 *     a <http://purl.org/ontology/bibo/Document> ;
 *       "10.1002/zaac.19936190205" ;
 *     <https://data.istex.fr/ontology/istex#idIstex> "F6CB7249E90BD96D5F7E3C4E80CC1C3FEE4FF483" ;
 *     <http://purl.org/dc/terms/creator> "Geoffrey Strickland" ;
 *     <https://data.istex.fr/ontology/istex#affiliation> "University of Reading" ;
 *
 * @param {Object} [property=[]]    path to uri for the properties to output (property and uri separated by ` -> `)
 *
 * @param {string} [source=""]  the root of the keys (ex: `istex/`)
 * @returns {string}
 */
function ISTEXTriplify(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const source = this.getParam('source', '');
    const property = this.getParam('property', []);
    const properties = Array.isArray(property)
        ? property.map(prop => prop.split(' -> '))
        : [property].map(prop => prop.split(' -> '));
    const regexps = properties
        .map(([path, prop]) => ([
            new RegExp(path),
            prop,
        ]));

    // Ignore empty objects (hoping that next objects will still arrive)
    if (!data[`${source}id`]) {
        if (process.env.DEBUG) {
            // eslint-disable-next-line no-console
            console.error(`#${this.getIndex()}: Empty object`);
        }
        return feed.end();
    }

    feed.write(`<https://api.istex.fr/${data[`${source}arkIstex`]}> <https://data.istex.fr/ontology/istex#idIstex> "${data[`${source}id`]}" .\n`);
    feed.write(`<https://api.istex.fr/${data[`${source}arkIstex`]}> <https://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://purl.org/ontology/bibo/Document> .\n`);

    const dataArray = Object.entries(data);

    regexps.forEach(([regex, prop]) => {
        dataArray
            .filter(([key]) => key.match(regex))
            .forEach(([, value]) => {
                if (!value) return;
                if (value.startsWith('http')) {
                    feed.write(`<https://api.istex.fr/${data[`${source}arkIstex`]}> <${prop}> <${value}> .\n`);
                } else {
                    feed.write(`<https://api.istex.fr/${data[`${source}arkIstex`]}> <${prop}> "${value}" .\n`);
                }
            });
    });

    feed.end();
}

export default {
    ISTEXTriplify,
};
