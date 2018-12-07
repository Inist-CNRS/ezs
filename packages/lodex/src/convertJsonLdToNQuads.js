import jsonld from 'jsonld';

/**
 * Take a JSON-LD object and transform it into NQuads triples.
 *
 * @name convertJsonLdToNQuads
 * @param none.
 * @returns {String}
 */
export default function convertJsonLdToNQuads(data, feed) {
    if (this.isLast()) {
        feed.close();
    } else {
        jsonld.toRDF(
            data,
            {
                format: 'application/nquads',
            },
            (err, nquads) => {
                if (err) {
                    // eslint-disable-next-line no-console
                    console.error('convertJsonLdToNQuads: ', err);
                    feed.stop(new Error(err));
                }
                feed.send(nquads);
            },
        );
    }
}
