import get from 'lodash.get';
import mongoDatabase from './mongoDatabase';

/**
 * Take 3 paramettre use for creating an join query between two element (one to many, on sub-ressource)
 *
 * The input object must contain a `connectionStringURI` property, containing
 * the connection string to MongoDB.
 *
 * @name LodexAggregateQuery
 * @param {String}  [collection="publishedDataset"]  collection to use
 * @param {Object}  [referer]      data injected into every result object
 * @param {String}  [matchField]   Lodex flield, containing matcheble element
 * @param {String}  [matchValue]   Value use with the match field for geting items
 * @param {String}  [joinField]    Lodex flield use for joining matching item and any ressource
 * @param {Object}  [limit]        limit the result
 * @param {Object}  [skip]         limit the result
 * @returns {Object}
 */
export default async function LodexJoinQuery(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const { ezs } = this;
    const referer = this.getParam('referer', data.referer);

    const matchField = this.getParam('matchField', data.matchField || '');
    const matchValue = this.getParam('matchValue', data.matchValue || '');
    const joinField = this.getParam('joinField', data.joinField || '');

    const collectionName = this.getParam('collection', data.collection || 'publishedDataset');
    const limit = this.getParam('limit', data.limit || 1000000);
    const skip = this.getParam('skip', data.skip || 0);
    const connectionStringURI = this.getParam(
        'connectionStringURI', data.connectionStringURI || '',
    );
    const db = await mongoDatabase(connectionStringURI);
    const collection = db.collection(collectionName);

    if (matchField === '' || joinField === '') return feed.send({ total: 0 });

    const aggregateQuery = [
        { $match: { [`versions.0.${matchField}`]: matchValue, removedAt: { $exists: false } } },
        { $project: { _id: 1, [`versions.${matchField}`]: 1 } },
        { $unwind: '$versions' },
        { $project: { [`${matchField}`]: `$versions.${matchField}` } },
        { $unwind: `$${matchField}` },
        { $group: { _id: 0, items: { $push: `$${matchField}` } } },
    ];

    const aggregateCursor = await collection.aggregate(aggregateQuery);

    const results = await aggregateCursor.toArray();

    if (results.length === 0) { return feed.send({ total: 0 }); }

    const findQuery = {
        [`versions.${joinField}`]: { $in: get(results, '0.items', []) },
    };

    const findCursor = await collection.find(findQuery);

    const findTotal = await findCursor.count();

    if (findTotal === 0) {
        return feed.send({ total: 0 });
    }

    const path = ['total'];
    const value = [findTotal];

    if (referer) {
        path.push('referer');
        value.push(referer);
    }

    const stream = findCursor
        .skip(Number(skip))
        .limit(Number(limit))
        .pipe(ezs('assign',
            {
                path,
                value,
            }));

    feed.flow(stream);
}
