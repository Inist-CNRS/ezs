import RJSON from 'relaxed-json';
import mongoDatabase from './mongoDatabase';

const stageNameTest = /^\$/;
/**
 * Take `Object` containing a MongoDB aggregate query and throw the result
 *
 * The input object must contain a `connectionStringURI` property, containing
 * the connection string to MongoDB.
 *
 * @name LodexAggregateQuery
 * @param {String}  [collection="publishedDataset"]  collection to use
 * @param {Object}  [referer]      data injected into every result object
 * @param {Object}  [filter]       MongoDB filter
 * @param {Object}  [limit]        limit the result
 * @param {Object}  [skip]         limit the result
 * @returns {Object}
 */
export const createFunction = () => async function LodexAggregateQuery(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const { ezs } = this;
    const referer = this.getParam('referer', data.referer);
    const filter = this.getParam('filter', data.filter || {});
    const stages = []
        .concat(this.getParam('stage'))
        .filter(Boolean)
        .map((a) => String(a).trim())
        .filter((b) => stageNameTest.test(b))
        .map((c) => RJSON.parse(`{${c}}`));

    filter.removedAt = { $exists: false }; // Ignore removed resources
    const collectionName = this.getParam('collection', data.collection || 'publishedDataset');
    const limit = this.getParam('limit', data.limit || 1000000);
    const skip = this.getParam('skip', data.skip || 0);
    const connectionStringURI = this.getParam(
        'connectionStringURI',
        data.connectionStringURI || '',
    );
    const db = await mongoDatabase(connectionStringURI);
    const collection = db.collection(collectionName);
    const cursor = collection.aggregate([{ $match: filter }].concat(stages));
    const isFilled = await cursor.hasNext();
    if (!isFilled) {
        return feed.send({ total: 0 });
    }
    const count = await collection.aggregate([{ $match: filter }, { $count: 'value' }]).toArray();
    const path = ['total'];
    const value = [(count[0] ? count[0].value : 0)];
    if (referer) {
        path.push('referer');
        value.push(referer);
    }
    const stream = cursor
        .skip(Number(skip))
        .limit(Number(limit))
        .pipe(ezs('assign', { path, value }));
    feed.flow(stream);
};

export default {
    aggregateQuery: createFunction(),
};
