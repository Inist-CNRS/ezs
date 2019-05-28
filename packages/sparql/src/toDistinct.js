/**
 * Format SPARQLQuery result as a LODEX routine.
 *
 * The input should contain **at least two fields**:
 * - the first is corresponding with the **_id** output field
 * - the second is corresponding with the **value** output field
 *
 * > **Warning**: input's second field value should contain an integer
 *
 * @example <caption>Input:</caption>
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
 *          "value": "https://bibliography.data.istex.fr/notice/graph" },
 *       "nb": {
 *          "type": "typed-literal",
 *          "datatype": "http://www.w3.org/2001/XMLSchema#integer",
 *          "value": "308023584" }},
 *     { "g": {
 *          "type": "uri",
 *          "value": "https://scopus-category.data.istex.fr/graph"},
 *       "nb": {
 *          "type":
 *          "typed-literal",
 *          "datatype": "http://www.w3.org/2001/XMLSchema#integer",
 *          "value": "2542"
 *     }}
 *   ]}
 * }
 *
 * @example <caption>Output:</caption>
 * {
 *    "total": 3,
 *    "data": [{
 *         "_id": "http://www.openlinksw.com/schemas/virtrdf#",
 *         "value": 2477
 *       }, {
 *         "_id": "https://bibliography.data.istex.fr/notice/graph",
 *         "value": 308023584
 *       }, {
*          "_id": "https://scopus-category.data.istex.fr/graph",
*          "value": 2542
*        }
 *    ]
 * }
 *
 * @export
 * @see SPARQLQuery
 * @name SPARQLToDistinct
 */
export default function SPARQLToDistinct(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }

    const { head: { vars }, results: { bindings } } = data;

    if (vars.length < 2) { throw new Error('Result of query should have at least two columns !'); }

    const [firstVar, secondVar] = vars;

    const returnedData = { total: bindings.length };
    returnedData.data = bindings.map((elem) => {
        const id = elem[firstVar].value;
        const val = Number(elem[secondVar].value);

        if (Number.isNaN(val)) {
            throw new Error('The second column should contains only numbers');
        }

        return {
            _id: id,
            value: val,
        };
    });

    feed.write(returnedData);
    feed.end();
}
