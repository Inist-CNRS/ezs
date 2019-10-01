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
            })
            .catch(done);
    }, 150000);
    afterAll(() => mongoUnit.stop());

    beforeEach(() => mongoUnit.initDb(connectionStringURI, publishedDataset));
    afterEach(() => mongoUnit.drop());

    it('should return results', (done) => {
        let res = [];
        from([{
            connectionStringURI,
        }])
            .pipe(ezs('LodexRunQuery'))
            // .pipe(ezs('debug'))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toHaveLength(10);
                done();
            });
    });

    it('should limit result to one result', (done) => {
        let res = [];
        from([{
            connectionStringURI,
            limit: 1,
        }])
            .pipe(ezs('LodexRunQuery'))
            // .pipe(ezs('debug'))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toHaveLength(1);
                done();
            });
    });

    it('should skip results', (done) => {
        let res = [];
        from([{
            connectionStringURI,
            skip: 9,
        }])
            .pipe(ezs('LodexRunQuery'))
            // .pipe(ezs('debug'))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toHaveLength(1);
                expect(res[0].uri).toBe('ark:/67375/XTP-L5L7X3NF-P');
                done();
            });
    });

    it('should return the total number of results / 0', (done) => {
        let res = [];
        from([{
            connectionStringURI,
            filter: { _id: 0 },
        }])
            .pipe(ezs('LodexRunQuery'))
            // .pipe(ezs('debug'))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toHaveLength(1);
                expect(res[0].total).toBe(0);
                done();
            });
    });

    it('should return the total number of results / 10', (done) => {
        let res = [];
        from([{
            connectionStringURI,
            limit: 1,
        }])
            .pipe(ezs('LodexRunQuery'))
            // .pipe(ezs('debug'))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toHaveLength(1);
                expect(res[0].total).toBe(10);
                done();
            });
    });

    it('should return referer', (done) => {
        let res = [];
        from([{
            connectionStringURI,
            limit: 2,
            referer: 'referer',
        }])
            .pipe(ezs('LodexRunQuery'))
            // .pipe(ezs('debug'))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toHaveLength(2);
                expect(res[0].total).toBe(10);
                expect(res[0].referer).toBe('referer');
                expect(res[1].referer).toBe('referer');
                done();
            });
    });

    it.skip('should select one field', (done) => {
        let res = [];
        from([{
            connectionStringURI,
            limit: 2,
            field: 'uri',
        }])
            .pipe(ezs('LodexRunQuery'))
            .pipe(ezs('debug'))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toHaveLength(2);
                expect(res[0].uri).toBeDefined();
                expect(res[0].versions).not.toBeDefined();
                done();
            });
    });

    it.skip('should select an array of fields', (done) => {
        let res = [];
        from([{
            connectionStringURI,
            limit: 2,
            field: ['uri'],
        }])
            .pipe(ezs('LodexRunQuery'))
            .pipe(ezs('debug'))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toHaveLength(2);
                expect(res[0].uri).toBeDefined();
                expect(res[0].versions).not.toBeDefined();
                done();
            });
    });
});
