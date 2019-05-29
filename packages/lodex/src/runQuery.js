import set from 'lodash.set';
import zipObject from 'lodash.zipobject';
import { MongoClient } from 'mongodb';

export const createFunction = () => async function LodexRunQuery(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const filter = this.getParam('filter', data.filter || {});
    const field = this.getParam(
        'field',
        data.field || data.$field || 'uri',
    );
    const collectionName = this.getParam('collection', data.collection || 'publishedDataset');
    const fds = Array.isArray(field) ? field : [field];
    const fields = fds.filter(Boolean);
    const limit = this.getParam('limit', data.limit || 1000000);
    const skip = this.getParam('skip', data.skip || 0);
    const projection = zipObject(fields, Array(fields.length).fill(true));
    const connectionStringURI = this.getParam(
        'connectionStringURI',
        data.connectionStringURI || '',
    );
    const client = await MongoClient.connect(
        connectionStringURI,
        {
            useNewUrlParser: true,
        },
    );
    const db = client.db();
    const collection = db.collection(collectionName);
    const cursor = collection.find(filter, fields.length > 0 ? projection : null);
    const total = await cursor.count();
    if (total === 0) {
        return feed.send({ total: 0 });
    }
    const stream = cursor
        .skip(Number(skip))
        .limit(Number(limit));
    stream.on('data', (data1) => {
        if (typeof data1 === 'object') {
            if (data1) {
                set(data1, 'total', total);
            }
            feed.write(data1);
        }
    });
    stream.on('error', (error) => {
        feed.write(error);
    });
    stream.on('end', () => {
        feed.end();
        client.close();
    });
};

export default {
    runQuery: createFunction(),
};
