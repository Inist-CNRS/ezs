/**
 * Take a query share link from a YASGUI editor and convert them into an object
 * which contains the query and the endpoint. Then, it could be used by ` SPARQLQuery ` instruction.
 *
 * @example <caption>Input:</caption>
 * {
 *   linkQuery: 'https://data.istex.fr/triplestore/sparql/#query=SELECT+DISTINCT+%3Fg%2C+count(*)+AS+%3Fnb+%0AWHERE+%0A%7B+%0A%09graph+%3Fg+%7B+%3Fs+%3Fp+%3Fo+%7D+%0A%7D+%0ALIMIT+3&contentTypeConstruct=text%2Fturtle&endpoint=https%3A%2F%2Fdata.istex.fr%2Fsparql%2F&outputFormat=table'
 * }
 *
 * @example <caption>Output:</caption>
 *   { query: 'SELECT DISTINCT ?g, count(*) AS ?nb WHERE { graph ?g { ?s ?p ?o } } LIMIT 3',
 *  endpoint: 'https://data.istex.fr/sparql/' }
 *
 * @export
 * @name SPARQLDecodeQuery
 */
export default function SPARQLDecodeQuery(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const { linkQuery } = data;
    if (!linkQuery) {
        throw new Error('No share link given !');
    }
    const reduced = linkQuery.substr(linkQuery.indexOf('#') + 1);
    const keyValuePairs = reduced.split('&').map(elem => elem.split('='));
    const cleaned = keyValuePairs.map(([key, value]) => [key, decodeURIComponent(value && value.replace(/\+/g, ' '))]);
    const result = cleaned.reduce((acc, [key, value]) => {
        acc[key] = value;
        return acc;
    }, {});

    const { query, endpoint } = result;
    if (!query || !endpoint) {
        throw new Error('Invalid link !');
    }
    feed.write(result);
    feed.end();
}
