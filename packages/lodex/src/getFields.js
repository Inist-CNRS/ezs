import { MongoClient } from 'mongodb';

/**
 * Return the fields (the model) of a LODEX.
 *
 * @export
 * @name LodexGetFields
 */
export const createFunction = () => async function LodexGetFields(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
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
    const collection = db.collection('field');
    const cursor = collection.find();

    cursor
        .sort({ position: 1, cover: 1 })
        .on('data', (data2) => {
            if (typeof data2 === 'object') {
                feed.write({ fields: data2 });
            }
        })
        .on('error', (error) => {
            feed.write(error);
        })
        .on('end', () => {
            feed.end();
            client.close();
        });
};

export default {
    getFields: createFunction(),
};
