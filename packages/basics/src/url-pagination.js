/**
 * Take `Object` and multiple it to make it one object per page
 *
 *
 * Input:
 *
 * ```json
 * [{"q": "a"}]
 * ```
 *
 * Script:
 *
 * ```ini
 * [URLRequest]
 * url = https://api.search.net
 *
 * [URLPagination]
 * total = get('total')
 * ```
 *
 * Output:
 *
 * ```json
 * [
 *      {
 *          "q": "a",
 *          "total": 22
 *          "offset": 0,
 *          "pageNumber": 1,
 *          "totalPages", 3,
 *          "maxPages": 1000,
 *          "limit": 10
 *      },
 *      {
 *          "q": "a",
 *          "total": 22
 *          "offset": 10,
 *          "pageNumber": 2,
 *          "totalPages", 3,
 *          "maxPages": 1000,
 *          "limit": 10
 *      },
 *      {
 *          "q": "a",
 *          "total": 22
 *          "offset": 20,
 *          "pageNumber": 3,
 *          "totalPages", 3,
 *          "maxPages": 1000,
 *          "limit": 10
 *      }
 *  ]
 * ```
 *
 *
 * @name URLPagination
 * @param {Number} [total=0] total to use for the pagination
 * @param {Number} [limit=10] limit to use to pagination
 * @param {Number} [maxPages=1000] maxPages to use to pagination
 * @returns {Object}
 */
export default function URLPagination(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const total = Number(this.getParam('total', 0));
    const limit = Number(this.getParam('limit', 10));
    const maxPages = Number(this.getParam('maxPages', 1000));
    if (total === 0) {
        return feed.send(new Error('No result.'));
    }
    if (Number.isNaN(total)) {
        return feed.send(new Error('Unexpected response.'));
    }
    let totalPages = Math.ceil(total / limit);
    if (totalPages > maxPages) {
        totalPages = maxPages;
    }
    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber += 1) {
        feed.write({
            ...data,
            offset: ((pageNumber - 1) * limit),
            pageNumber,
            totalPages,
            maxPages,
            limit,
        });
    }
    feed.end();
}
