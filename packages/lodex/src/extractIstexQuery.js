function removeNumberInstance(uri) {
    const reg = new RegExp('(\\-\\d+)(\\.[a-z]+)+');
    const match = reg.exec(uri);

    if (match !== null) {
        return uri.replace(match[1], '');
    }

    return uri;
}

/**
 * @typedef {Object<string, any>} Field
 * @property {string} scheme The semantic property of the field.
 * @property {Object} format The format of the field.
 */
/**
 * Extract an ISTEX API query.
 *
 * @param {Array<Field>} [fields=[]]   list of LODEX fields
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

    const field = fields.filter(f => f.format && f.format.name === 'istex')[0];
    const propertyName = field.name;

    const formatedUri = removeNumberInstance(data.uri);

    return feed.send({
        lodex: {
            uri: formatedUri,
        },
        content: data[propertyName],
    });
};
