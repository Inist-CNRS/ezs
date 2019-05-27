const fetch = require('fetch-with-proxy').default;

/**
 * Take a SPARQL query and endpoint and send in output the execution result in JSON format.
 *
 * @example <caption>Input:</caption>
 * { query: 'SELECT DISTINCT ?g, count(*) AS ?nb WHERE { graph ?g { ?s ?p ?o } } LIMIT 3',
 *  endpoint: 'https://data.istex.fr/sparql/' }
 *
 * @example <caption>Ouput:</caption>
 * { "head": { "link": [], "vars": ["g", "nb"] },
 *   "results": { "distinct": false, "ordered": true, "bindings": [
 *     { "g": {
 *          "type": "uri",
 *          "value": "http://www.openlinksw.com/schemas/virtrdf#"
 *        },
 *       "nb": {
 *          "type": "typed-literal",
 *          "datatype": "http://www.w3.org/2001/XMLSchema#integer",
 *          "value": "2477"
 *     }},
 *     { "g": {
 *          "type": "uri",
 *          "value": "https://bibliography.data.istex.fr/notice/graph"
 *        },
 *       "nb": {
 *          "type": "typed-literal",
 *          "datatype": "http://www.w3.org/2001/XMLSchema#integer",
 *          "value": "308023584"
 *     }},
 *     { "g": {
 *          "type": "uri",
 *          "value": "https://scopus-category.data.istex.fr/graph"
 *        },
 *       "nb": {
 *          "type": "typed-literal",
 *          "datatype": "http://www.w3.org/2001/XMLSchema#integer",
 *          "value": "2542"
 *     }}
 *   ]}
 * }
 *
 * @export
 * @name SPARQLQuery
 */
export default async function SPARQLQuery(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }

    const { query, endpoint } = data;
    if (!query) {
        throw new Error('No query given!');
    }
    if (!endpoint) {
        throw new Error('No sparql endpoint given !');
    }

    const encoded = encodeURIComponent(query);
    const requestUrl = `${endpoint}?query=${encoded}`;

    const options = {
        headers: {
            Accept: 'application/sparql-results+json',
        },
    };

    const response = await fetch(requestUrl, options);
    if (!response.ok) {
        throw new Error('Can not connect to the sparql endpoint !');
    }
    let responseData;
    try {
        responseData = await response.json();
    } catch (error) {
        error.message = `The data can't be convert into a JSON object ! \n${error.message}`;
        throw error;
    }

    feed.write(responseData);
    return feed.end();
}
