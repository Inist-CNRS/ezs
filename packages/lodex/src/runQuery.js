import ezs from 'ezs';
import set from 'lodash.set';
import { MongoClient } from 'mongodb';

const connectionHandles = [];

async function connectTo(connectionStringURI, options) {

    if (connectionHandles[connectionStringURI]) {
        return connectionHandles[connectionStringURI];
    }
    connectionHandles[connectionStringURI] = await MongoClient.connect(
        connectionStringURI,
        options,
    );
    return connectionHandles[connectionStringURI];
}


export const createFunction = () =>
    async function LodexRunQuery(data, feed) {
        if (this.isLast()) {
            return feed.close();
        }
        const filter = this.getParam('filter', data.filter || {});
        const limit = this.getParam('limit', data.limit || 1000000);
        const skip = this.getParam('skip', data.skip || 0);
        const sort = this.getParam('sort', data.sort || {});
        const connectionStringURI = this.getParam(
            'connectionStringURI',
            data.connectionStringURI || '',
        );
        const db = await connectTo(
            connectionStringURI,
            {
                poolSize: 10,
            },
        );
        const collection = db.collection('publishedDataset');
        const cursor = collection.find(filter);
        const total = await cursor.count();
        const stream = cursor
            .skip(Number(skip))
            .limit(Number(limit))
            .sort(sort);
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
            feed.close();
        });
    };

export default {
    runQuery: createFunction(),
};
