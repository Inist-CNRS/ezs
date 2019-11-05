import { MongoClient } from 'mongodb';

const handles = {};
async function mongoDatabase(connectionStringURI) {
    if (!handles[connectionStringURI]) {
        handles[connectionStringURI] = new MongoClient(
            connectionStringURI,
            {
                useNewUrlParser: true,
                poolSize: 10,
            },
        );
    }
    if (handles[connectionStringURI].isConnected()) {
        return handles[connectionStringURI].db();
    }
    const client = await handles[connectionStringURI].connect();
    return client.db();
}

export default mongoDatabase;
