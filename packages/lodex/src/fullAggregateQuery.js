import mongoDatabase from './mongoDatabase';

export default async function LodexFullAggregateQuery(data, feed) {
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

    const aggregateQuery = [
        { $match: { [`versions.0.${matchField}`]: matchValue, removedAt: { $exists: false } } },
        { $project: { _id: 1, [`versions.${matchField}`]: 1 } },
        { $unwind: '$versions' },
        { $project: { [`${matchField}`]: `$versions.${matchField}` } },
        { $unwind: `$${matchField}` },
        { $group: { _id: 0, items: { $push: `$${matchField}` } } },
    ];

    const aggregateCursor = await collection.aggregate(aggregateQuery);

    let results;
    try {
        await aggregateCursor.forEach((e) => {
            if (results === undefined && ![null, undefined].includes(e.items)) results = e.items;
        });

        const aggregateTotal = results.length;
        if (aggregateTotal === 0) {
            return feed.send({ total: 0 });
        }
    } catch (e) {
        return feed.send({ total: 0 });
    }

    const findQuery = {
        [`versions.${joinField}`]: { $in: results },
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
        .pipe(ezs('assign', { path, value }));
    feed.flow(stream);
}
