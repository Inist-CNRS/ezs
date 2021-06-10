import _ from 'lodash';
import mongoDatabase from './mongoDatabase';

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
        { $project: { items: `$versions.${matchField}` } },
        // { $unwind: `$${matchField}` },
        // { $group: { _id: 0, items: { $push: `$${matchField}` } } },
    ];

    const aggregateCursor = await collection.aggregate(aggregateQuery);

    // const results = await aggregateCursor.toArray();

    // if (results.length === 0) { return feed.send({ total: 0 }); }

    // [
    //     {_id: 1, items: ["A", "B"]},
    //     {_id: 2, items: ["B"]}
    // ]
    //
    // {
    //     "A": 1,
    //     "B": 2
    // }

    const results = {};
    await aggregateCursor
        .forEach((row) => {
            _.get(row, 'items', []).forEach((item) => {
                const itemValue = _.get(results, item);
                if (itemValue) {
                    _.set(results, item, itemValue + 1);
                } else {
                    _.set(results, item, 1);
                }
            });
        });

    console.dir(results);

    const findQuery = {
        [`versions.${joinField}`]: { $in: _.keys(results) },
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
            }))
        .pipe((v)=>{console.log(v); return v})
    ;

    feed.flow(stream);
}
