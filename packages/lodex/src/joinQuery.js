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
    ];

    const aggregateCursor = await collection.aggregate(aggregateQuery);

    const results = {};
    await aggregateCursor
        .forEach((row) => {
            _.get(row, 'items', []).forEach((item) => {
                if (item !== matchValue) {
                    const itemValue = _.get(results, item);
                    if (itemValue) {
                        _.set(results, item, itemValue + 1);
                    } else {
                        _.set(results, item, 1);
                    }
                }
            });
        });

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
        .pipe(ezs((input, output) => {
            if (input == null) {
                output.end();
                return;
            }
            const title = _.chain(input)
                .get('versions')
                .last()
                .get(joinField)
                .value();
            const count = _.get(results, title);
            _.set(input, 'count', count);
            output.send(input);
        }));

    feed.flow(stream);
}
