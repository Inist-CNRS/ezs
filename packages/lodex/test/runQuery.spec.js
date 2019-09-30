import from from 'from';
import mongoUnit from 'mongo-unit';
import ezs from '../../core/src';
import ezsLodex from '../src';

ezs.use(ezsLodex);

describe('runQuery', () => {
    const publishedDataset = require('./fixture.publishedDataset.json');
    let connectionStringURI;

    beforeAll((done) => {
        mongoUnit
            .start()
            .then((testMongoUrl) => {
                connectionStringURI = testMongoUrl;
                done();
            });
    }, 100000);
    afterAll(() => mongoUnit.stop());

    beforeEach(() => mongoUnit.initDb(connectionStringURI, publishedDataset));
    afterEach(() => mongoUnit.drop());

    it('should return results', (done) => {
        let res = [];
        from([{
            connectionStringURI,
        }])
            .pipe(ezs('LodexRunQuery'))
            .pipe(ezs('debug'))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toHaveLength(10);
                done();
            });
    });
});
