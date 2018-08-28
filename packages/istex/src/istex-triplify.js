/**
 * Take `Object` containing flatten hits from ISTEXResult.
 *
 * @see ISTEXResult
 * @see OBJFlatten (from ezs-basics)
 *
 * @example
 *
 * data: {
 * 'ISTEX/author/0/name': 'Geoffrey Strickland',
 * 'ISTEX/author/0/affiliations/0': 'University of Reading',
 * 'ISTEX/host/issn/0': '0047-2441',
 * 'ISTEX/host/eissn/0': '1740-2379',
 * 'ISTEX/title': 'Maupassant, Zola, Jules Vallès and the Paris Commune of 1871',
 * 'ISTEX/publicationDate': '1983',
 * 'ISTEX/doi/0': '10.1177/004724418301305203',
 * 'ISTEX/id': 'F6CB7249E90BD96D5F7E3C4E80CC1C3FEE4FF483',
 * 'ISTEX/score': 1 }
 *
 * @example
 *
 * .pipe(ezs('ISTEXTriplify', {
 *    source: 'ISTEX',
 *    property: [
 *      'ISTEX/doi/0 -> http://purl.org/ontology/bibo/doi',
 *      'ISTEX/language -> http://purl.org/dc/terms/language',
 *      'ISTEX/author/\\d+/name -> http://purl.org/dc/terms/creator',
 *      'ISTEX/author/\\d+/affiliations -> https://data.istex.fr/ontology/istex#affiliation',
 *    ],
 *  ));
 *
 * @example
 *
 *  `<https://data.istex.fr/document/F6CB7249E90BD96D5F7E3C4E80CC1C3FEE4FF483>
 *     a <http://purl.org/ontology/bibo/Document> ;
 *       "10.1002/zaac.19936190205" ;
 *     <https://data.istex.fr/ontology/istex#idIstex> "F6CB7249E90BD96D5F7E3C4E80CC1C3FEE4FF483" ;
 *     <http://purl.org/dc/terms/creator> "Geoffrey Strickland" ;
 *     <https://data.istex.fr/ontology/istex#affiliation> "University of Reading" ;
 *  `
 *
 * @param {Object} [property=[]]    path to uri for the properties to output (property and uri separated by ` -> `)
 * @param {string} [source="istex"] the root of the keys
 * @returns {string}
 */
function ISTEXTriplify(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const source = this.getParam('source', 'istex');
    const property = this.getParam('property', []);
    const properties = property
        .map(prop => prop.split(' -> '))
        .reduce((props, [prop, value]) => {
            props[prop] = value;
            return props;
        }, {});
    const regexps = Object
        .keys(properties)
        .map(path => ([
            new RegExp(path),
            path,
        ]));

    feed.write(`<https://data.istex.fr/document/${data[`${source}/id`]}> <https://data.istex.fr/ontology/istex#idIstex> "${data[`${source}/id`]}" .\n`);
    feed.write(`<https://data.istex.fr/document/${data[`${source}/id`]}> a <http://purl.org/ontology/bibo/Document> .\n`);

    const dataArray = Object.entries(data);

    regexps.forEach(([regex, path]) => {
        dataArray
            .filter(([key]) => key.match(regex))
            .forEach(([, value]) => {
                feed.write(`<https://data.istex.fr/document/${data[`${source}/id`]}> <${properties[path]}> "${value}" .\n`);
            });
    });

    feed.end();
}

export default {
    ISTEXTriplify,
};
