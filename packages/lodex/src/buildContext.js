/**
 * Take `Object` containing a URL query and throw a Context Object
 * compatible with runQuery or reduceQuery
 *
 * @name LodexBuildContext
 * @param {String}  [connectionStringURI="mongodb://ezmaster_db:27017"]  to connect to MongoDB
 * @param {String}  [host] to set host (usefull to build some links)
 * @returns {Object}
 */
export const createFunction = () => async function LodexBuildContext(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }

    const connectionStringURI = this.getParam('connectionStringURI', 'mongodb://ezmaster_db:27017');
    const host = this.getParams('host');
    const {
        uri,
        maxSize,
        skip,
        maxValue,
        minValue,
        match,
        orderBy = '_id/asc',
        invertedFacets = [],
        $query,
        field,
        ...facets
    } = data;
    const handleDb = await mongoClient();
    const fieldHandle = await getFields(handleDb);
    const searchableFieldNames = await fieldHandle.findSearchableNames();
    const facetFieldNames = await fieldHandle.findFacetNames();
    const fields = await fieldHandle.findAll();
    const filter = getPublishedDatasetFilter({
        uri,
        match,
        invertedFacets,
        facets,
        ...$query,
        searchableFieldNames,
        facetFieldNames,
    });

    if (filter.$and && !filter.$and.length) {
        delete filter.$and;
    }
    // context is the intput for LodexReduceQuery & LodexRunQuery & LodexDocuments
    const context = {
        // /*
        // to build the MongoDB Query
        filter,
        field,
        fields,
        // Default parameters for ALL scripts
        maxSize,
        maxValue,
        minValue,
        orderBy,
        uri,
        host,
        // to allow script to connect to MongoDB
        connectionStringURI,
    };
    feed.send(context);
};

export default {
    buildContext: createFunction(),
};
