function removeNumberInstance(uri) {
    const reg = new RegExp('(\\-\\d+)(\\.[a-z]+)+');
    const match = reg.exec(uri);

    if (match !== null) {
        return uri.replace(match[1], '');
    }

    return uri;
}

/**
 * Extract an ISTEX API query.
 *
 * @param {Array<Object>} [fields=[]]   list of LODEX fields
 * @name extractIstexQuery
 * @example
 * {
 *    content: 'fake query',
 *    lodex: {
 *       uri: 'http://resource.uri',
 *   },
 * }
 * @returns
 */
module.exports = function extractIstexQuery(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }

    const fields = this.getParam('fields', []);

    /*
     * If we don't have any istexQuery, close the export
     */
    if (!fields.some(f => f.format && f.format.name === 'istex')) {
        return feed.close();
    }

    return fields
        .filter(field => field.format && field.format.name === 'istex')
        .forEach((field) => {
            const propertyName = field.name;

            const formatedUri = removeNumberInstance(data.uri);

            return feed.send({
                lodex: {
                    uri: formatedUri,
                },
                content: data[propertyName],
            });
        });
};
