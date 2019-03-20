import ezs from 'ezs';
import set from 'lodash.set';
import { MongoClient } from 'mongodb';

export const createFunction = () =>
    async function LodexRunQuery(data, feed) {
        if (this.isLast()) {
            return feed.close();
        }
        const filter = this.getParam('filter', data.filter || {});
        const limit = this.getParam('limit', data.limit || 1000000);
        const skip = this.getParam('skip', data.skip || 0);
        const connectionStringURI = this.getParam(
            'connectionStringURI',
            data.connectionStringURI || '',
        );
        const client = await MongoClient.connect(
            connectionStringURI,
            {
                poolSize: 10,
            },
        );
        const db = client.db();
        const collection = db.collection('publishedDataset');
        const cursor = collection.find(filter);
        const total = await cursor.count();
        if (total === 0) {
            return feed.send({total : 0});
        }
        const stream = cursor
            .skip(Number(skip))
            .limit(Number(limit));
        stream.on('data', data1 => {
            if (typeof data1 === 'object') {
                if (data1) {
                    set(data1, 'total', total);
                }
                feed.write(data1);
            }
        });
        stream.on('error', error => {
            feed.write(error);
        });
        stream.on('end', () => {
            feed.end();
        });
    };

export default {
    runQuery: createFunction(),
};
