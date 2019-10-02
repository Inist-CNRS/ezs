import from from 'from';
import mongoUnit from 'mongo-unit';
import ezs from '../../core/src';
import ezsLodex from '../src';

ezs.use(ezsLodex);

describe('mongo queries', () => {
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

    describe('runQuery', () => {
        beforeEach(() => mongoUnit.initDb(connectionStringURI, publishedDataset));
        afterEach(() => mongoUnit.drop());

        it('should return results', (done) => {
            let res = [];
            from([
                {
                    connectionStringURI,
                },
            ])
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
            from([
                {
                    connectionStringURI,
                    limit: 1,
                },
            ])
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
            from([
                {
                    connectionStringURI,
                    skip: 9,
                },
            ])
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
            from([
                {
                    connectionStringURI,
                    filter: { _id: 0 },
                },
            ])
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
            from([
                {
                    connectionStringURI,
                    limit: 1,
                },
            ])
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
            from([
                {
                    connectionStringURI,
                    limit: 2,
                    referer: 'referer',
                },
            ])
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
            from([
                {
                    connectionStringURI,
                    limit: 2,
                    field: 'uri',
                },
            ])
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
            from([
                {
                    connectionStringURI,
                    limit: 2,
                    field: ['uri'],
                },
            ])
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

    describe('reduceQuery', () => {
        beforeEach(() => mongoUnit.initDb(connectionStringURI, publishedDataset));
        afterEach(() => mongoUnit.drop());

        it('should throw when no reducer is given', (done) => {
            from([{
                connectionStringURI,
            }])
                .pipe(ezs('LodexReduceQuery'))
                .pipe(ezs('debug'))
                .on('error', (err) => {
                    expect(err).toBeInstanceOf(Error);
                    expect(err.message).toContain('reducer= must be defined as parameter.');
                    done();
                })
                .on('end', () => {
                    done(new Error('No error was thrown!'));
                });
        });

        it('should throw when the reducer is not found', (done) => {
            from([{
                connectionStringURI,
            }])
                .pipe(ezs('LodexReduceQuery', { reducer: 'foo' }))
                .pipe(ezs('debug'))
                .on('error', (err) => {
                    expect(err).toBeInstanceOf(Error);
                    expect(err.message).toContain('Unknown reducer \'foo\'');
                    done();
                })
                .on('end', () => {
                    done(new Error('No error was thrown!'));
                });
        });

        describe('count', () => {
            it('should count the fields/resources(?) values', (done) => {
                let res = [];
                from([{
                    connectionStringURI,
                }])
                    .pipe(ezs('LodexReduceQuery', { reducer: 'count' }))
                    .on('data', (data) => {
                        res = [...res, data];
                    })
                    .on('end', () => {
                        expect(res).toHaveLength(1);
                        expect(res).toEqual([{
                            _id: 'uri',
                            total: 1,
                            value: 10,
                        }]);
                        done();
                    });
            });
        });

        describe('distinct', () => {
            it('should return the different distinct values', (done) => {
                let res = [];
                from([{
                    connectionStringURI,
                }])
                    .pipe(ezs('LodexReduceQuery', { reducer: 'distinct' }))
                    .on('data', (data) => {
                        res = [...res, data];
                    })
                    .on('end', () => {
                        expect(res).toHaveLength(10);
                        expect(res[0]).toEqual({
                            _id: 'ark:/67375/XTP-1JC4F85T-7',
                            total: 10,
                            value: 1,
                        });
                        done();
                    });
            });
        });
    });
});
