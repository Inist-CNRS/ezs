/**
 * Take `Object` containing hits from ISTEXResult.
 *
 * @example
 * .pipe(ezs('ISTEXTriplify', {
 *    properties: {
 *      'ISTEX/doi/': 'http://purl.org/ontology/bibo/doi',
 *      'ISTEX/language/': 'http://purl.org/dc/terms/language',
 *      'ISTEX/author/\\d/name': 'http://purl.org/dc/terms/creator',
 *      'ISTEX/author/\\d/affiliations': 'https://data.istex.fr/ontology/istex#affiliation',
 *    },
 *  ));
 * --->
 *  <https://data.istex.fr/document/2FF3F5B1477986B9C617BB75CA3333DBEE99EB05>
 *   a <http://purl.org/ontology/bibo/Document> ;
 *     "10.1002/zaac.19936190205"ISTEX ;
 *   <https://data.istex.fr/ontology/istex#idIstex> "2FF3F5B1477986B9C617BB75CA3333DBEE99EB05" .
 *   <http://purl.org/dc/terms/creator> "Steve Parker" .
 *   <https://data.istex.fr/ontology/istex#affiliation> "Graduate Institute of Applied Linguistics" .
 *   <https://data.istex.fr/ontology/istex#affiliation> "E-mail: steve-monica_parker@sil.org" .
 *
 * @param {Object} [properties={}]  path to uri for the properties to output
 * @returns {string}
 */
function ISTEXTriplify(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const properties = this.getParam('properties', {})
    const regexps = Object
      .keys(properties)
      .map(path => ([
        new RegExp(path),
        path,
      ]));

    feed.write(`<https://data.istex.fr/document/${data['istex/id']}> <https://data.istex.fr/ontology/istex#idIstex> "${data['istex/id']}" .\n`);
    feed.write(`<https://data.istex.fr/document/${data['istex/id']}> a <http://purl.org/ontology/bibo/Document> .\n`);

    const dataArray = Object.entries(data);

    regexps.forEach(([regex, path]) => {
        dataArray
            .filter(([key]) => key.match(regex))
            .forEach(([, value]) => {
                feed.write(`<https://data.istex.fr/document/${data['istex/id']}> <${properties[path]}> "${value}" .\n`);
            });
    });

    feed.end();
}

// data: {
// ...
// 'ISTEX/author/0/name': 'Geoffrey Strickland',
// 'ISTEX/author/0/affiliations/0': 'University of Reading',
// 'ISTEX/host/issn/0': '0047-2441',
// 'ISTEX/host/eissn/0': '1740-2379',
// 'ISTEX/title': 'Maupassant, Zola, Jules Vallès and the Paris Commune of 1871',
// 'ISTEX/publicationDate': '1983',
// 'ISTEX/doi/0': '10.1177/004724418301305203'ISTEX,
// 'ISTEX/id': 'F6CB7249E90BD96D5F7E3C4E80CC1C3FEE4FF483',
// 'ISTEX/score': 1 }

export default {
    ISTEXTriplify,
};
