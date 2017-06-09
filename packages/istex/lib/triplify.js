// function transform(str, transformer) {
//   if (!transformer || !Array.isArray(transformer) || transformer.length !== 2) {
//     return `"${str}"`;
//   }
//   const pattern = transformer[0];
//   const replacer = transformer[1];
//   return str.replace(pattern, replacer);
// }

/**
 * Triplify data
 *
 * Ex:
 * .pipe(ezs('ISTEXTriplify', {
 *    properties: {
 *      'ISTEX/doi/': 'http://purl.org/ontology/bibo/doi',
 *      'ISTEX/language/': 'http://purl.org/dc/terms/language'
 *    },
 *    transforms: {
 *      'ISTEX/language/': [
 *        /([a-z]{3})/,
 *        '<http://lexvo.org/id/iso639-3/$1>'
 *      ]
 *    }
 *  ));
 * --->
 * <https://data.istex.fr/document/2FF3F5B1477986B9C617BB75CA3333DBEE99EB05>
 *   a <http://purl.org/ontology/bibo/Document> ;
 *   <http://purl.org/dc/terms/language> <http://lexvo.org/id/iso639-3/fra> ;
 *   <http://purl.org/ontology/bibo/doi>  "10.1002/zaac.19936190205" ;
 *   <https://data.istex.fr/ontology/istex#idIstex> "2FF3F5B1477986B9C617BB75CA3333DBEE99EB05" .
 *
 */
module.exports = function triplify(data, feed) {
  const properties = this.getParam('properties', {});
  const transforms = this.getParam('transforms', null);

  if (this.isLast()) {
    feed.close();
    return;
  }

  feed.write(`<https://data.istex.fr/document/${data['ISTEX/id']}> <https://data.istex.fr/ontology/istex#idIstex> "${data['ISTEX/id']}" .\n`);
  feed.write(`<https://data.istex.fr/document/${data['ISTEX/id']}> a <http://purl.org/ontology/bibo/Document> .\n`);
  Object.keys(properties).forEach((path) => {
    if (path[path.length - 1] === '/') {
      // path points to an array
      const values = [];
      let i = 0;
      while (data[path + i]) {
        values.push(data[path + i]);
        i += 1;
      }
      if (values.length) {
        for (i = 0; i < values.length; i += 1) {
          let value = values[i];
          if (transforms && transforms[path]) {
            value = value.replace(transforms[path][0], transforms[path][1]);
          } else {
            value = `"${value}"`;
          }
          feed.write(`<https://data.istex.fr/document/${data['ISTEX/id']}> <${properties[path]}> ${value} .\n`);
        }
      }
    } else {
      // Path points to a single value
      let value = data[path];
      if (transforms && transforms[path]) {
        value = value.replace(transforms[path][0], transforms[path][1]);
      } else {
        value = `"${value}"`;
      }
      feed.write(`<https://data.istex.fr/document/${data['ISTEX/id']}> <${properties[path]}> ${value} .\n`);
    }
  });

  feed.end();
};

// <https://data.istex.fr/document/2FF3F5B1477986B9C617BB75CA3333DBEE99EB05>
//               a bibo:Document ;
//               dcterms:language <http://lexvo.org/id/iso639-3/fra> ;
//               bibo:doi  "10.1002/zaac.19936190205" ;
//               istex:idIstex "2FF3F5B1477986B9C617BB75CA3333DBEE99EB05" .
