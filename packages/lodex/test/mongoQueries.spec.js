import from from 'from';
import mongoUnit from 'mongo-unit';
import ezs from '../../core/src';
import ezsLodex from '../src';
import publishedDataset from './fixture.publishedDataset.json';
import publishedCharacteristic from './fixture.publishedCharacteristic.json';
import field from './fixture.field.json';

ezs.use(ezsLodex);

describe('mongo queries', () => {
    let connectionStringURI;

    beforeAll((done) => {
        mongoUnit
            .start( { verbose: false })
            .then((testMongoUrl) => {
                connectionStringURI = testMongoUrl;
                done();
            })
            .catch(done);
    }, 150000);
    afterAll(() => mongoUnit.stop());

    describe('getCharacteristics', () => {
        beforeEach(() => mongoUnit.initDb(connectionStringURI, publishedCharacteristic));
        afterEach(() => mongoUnit.drop());

        it('should return characteristics', (done) => {
            let res = [];
            from([{
                connectionStringURI,
            }])
                .pipe(ezs('LodexGetCharacteristics'))
                .on('data', (data) => {
                    res = [...res, data];
                })
                .on('end', () => {
                    expect(res).toHaveLength(1);
                    expect(res).toEqual([{
                        characteristics: {
                            _id: '5b2cc39cc767d60017eb131f',
                            V99c: 'Jeu de données sur les types de contenu',
                            AtQO: 'Ce jeu correspond au choix de documenter des données ISTEX et plus particulièrement'
                                + " les types de contenu utilisés dans ISTEX.\r\n \r\nIls ont fait l'objet d'une"
                                + " homogénéisation opérée par l'équipe ISTEX-DATA et d'un alignement avec le jeu de"
                                + ' données types de publication. \r\n\r\nCes types permettent de retranscrire la'
                                + " structuration initiale de l'ouvrage.",
                            gLBB: '/api/run/syndication',
                            G0Ux: 'https://docs.google.com/drawings/d/1rtQ5_GT9QIHKzEjXU5vzSiAnmcu-hdNuyuEArOwUEU4/pub?w=960&h=720',
                            etxw: '2017-10-02',
                            '7IpS': 'LODEX Team',
                            CAhi: 'http://www.istex.fr/wp-content/uploads/2015/02/2015_Licence-type-ISTEX.pdf',
                            PJTS: 'ISTEX',
                            publicationDate: '2018-06-22T09:38:36.475Z',
                        },
                    }]);
                    done();
                });
        });
    });

    describe('getFields', () => {
        beforeEach(() => mongoUnit.initDb(connectionStringURI, field));
        afterEach(() => mongoUnit.drop());

        it('should return the fields', (done) => {
            let res = [];
            from([{
                connectionStringURI,
            }])
                .pipe(ezs('LodexGetFields'))
                .on('data', (data) => {
                    res = [...res, data];
                })
                .on('end', () => {
                    expect(res).toHaveLength(20);
                    expect(res[0]).toEqual({
                        fields: {
                            _id: '5b2bd064c767d60017eb130f',
                            cover: 'collection',
                            display_on_list: true,
                            label: 'uri',
                            name: 'uri',
                            position: 0,
                            transformers: [{
                                args: [{
                                    name: 'column',
                                    type: 'column',
                                    value: 'uri',
                                }],
                                operation: 'COLUMN',
                            }],
                        },
                    });
                    done();
                });
        });
    });

    describe('runQuery', () => {
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

        it('should take field into account', (done) => {
            let res = [];
            from([{
                connectionStringURI,
            }])
                .pipe(ezs('LodexReduceQuery', {
                    reducer: 'distinct',
                    field: 'publicationDate',
                }))
                .on('data', (data) => {
                    res = [...res, data];
                })
                .on('end', () => {
                    expect(res).toHaveLength(2);
                    expect(res).toEqual([{
                        _id: '2018-06-22T09:38:36.468Z',
                        total: 2,
                        value: 5,
                    }, {
                        _id: '2018-06-22T09:38:36.469Z',
                        total: 2,
                        value: 5,
                    }]);
                    done();
                });
        });

        it('should take minValue into account', (done) => {
            let res = [];
            from([{
                connectionStringURI,
            }])
                .pipe(ezs('LodexReduceQuery', {
                    reducer: 'distinct',
                    field: 'publicationDate',
                    minValue: 6,
                }))
                .on('data', (data) => {
                    res = [...res, data];
                })
                .on('end', () => {
                    expect(res).toHaveLength(1);
                    expect(res).toEqual([{ total: 0 }]);
                    done();
                });
        });

        it('should take maxValue into account', (done) => {
            let res = [];
            from([{
                connectionStringURI,
            }])
                .pipe(ezs('LodexReduceQuery', {
                    reducer: 'distinct',
                    field: 'publicationDate',
                    maxValue: 4,
                }))
                .on('data', (data) => {
                    res = [...res, data];
                })
                .on('end', () => {
                    expect(res).toHaveLength(1);
                    expect(res).toEqual([{ total: 0 }]);
                    done();
                });
        });

        it('should inject referer into the results', (done) => {
            let res = [];
            from([{
                connectionStringURI,
            }])
                .pipe(ezs('LodexReduceQuery', {
                    reducer: 'distinct',
                    referer: 'referer',
                }))
                .on('data', (data) => {
                    expect(data).toHaveProperty('referer');
                    res = [...res, data];
                })
                .on('end', () => {
                    expect(res).toHaveLength(10);
                    done();
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

    describe('injectSyndicationFrom', () => {
        beforeEach(() => Promise.all([
            mongoUnit.initDb(connectionStringURI, publishedDataset),
            mongoUnit.initDb(connectionStringURI, field),
        ]));
        afterEach(() => mongoUnit.drop());

        it('should inject title & summary in each item', (done) => {
            const res = [];
            from([
                {
                    source: 'ark:/67375/XTP-1JC4F85T-7',
                },
                {
                    source: 'ark:/67375/XTP-HPN7T1Q2-R',
                },
                {
                    source: 'ark:/67375/XTP-HPN7T1Q2-R',
                },
            ])
                .pipe(ezs('injectSyndicationFrom', {
                    connectionStringURI,
                    path: 'source',
                }))
                .pipe(ezs('debug'))
                .on('data', (data) => {
                    res.push(data);
                })
                .on('end', () => {
                    expect(res).toHaveLength(3);
                    expect(res[0].source).toEqual('ark:/67375/XTP-1JC4F85T-7');
                    expect(res[0]['source-title']).toEqual('research-article');
                    expect(res[0]['source-summary']).toContain('Il s’agit d’une source primaire. ');
                    expect(res[1].source).toEqual('ark:/67375/XTP-HPN7T1Q2-R');
                    expect(res[1]['source-title']).toEqual('abstract');
                    expect(res[1]['source-summary']).toContain('Résumé d’un papier ou ');
                    expect(res[2].source).toEqual('ark:/67375/XTP-HPN7T1Q2-R');
                    expect(res[2]['source-title']).toEqual('abstract');
                    expect(res[2]['source-summary']).toEqual('Résumé d’un papier ou d’une présentation qui a été présentée ou publiée séparément.');
                    done();
                });
        });
    });

    describe('injectDatasetFields', () => {
        beforeEach(() => mongoUnit.initDb(connectionStringURI, publishedCharacteristic));
        afterEach(() => mongoUnit.drop());

        it('should inject dataset fiels in each item', (done) => {
            const res = [];
            from([
                {
                    item: 1,
                },
                {
                    item: 2,
                },
                {
                    item: 3,
                },
            ])
                .pipe(ezs('injectDatasetFields', {
                    connectionStringURI,
                }))
                .on('data', (data) => {
                    res.push(data);
                })
                .on('end', () => {
                    expect(res).toHaveLength(3);
                    expect(res[0].item).toEqual(1);
                    expect(res[0].PJTS).toEqual('ISTEX');
                    expect(res[1].item).toEqual(2);
                    expect(res[1].PJTS).toEqual('ISTEX');
                    expect(res[2].item).toEqual(3);
                    expect(res[2].PJTS).toEqual('ISTEX');
                    done();
                });
        });
    });

    describe('labelizeFieldID', () => {
        beforeEach(() => mongoUnit.initDb(connectionStringURI, field));
        afterEach(() => mongoUnit.drop());

        const input = [
            {
                tfFF: 1,
                BoJb: 'A',
                toto: true,
            },
            {
                tfFF: 2,
                BoJb: 'B',
                toto: true,
            },
            {
                tfFF: 3,
                BoJb: 'C',
                toto: true,
            },
        ];

        it('should labelize each item', (done) => {
            const res = [];
            from(input)
                .pipe(ezs('labelizeFieldID', {
                    connectionStringURI,
                }))
                .on('data', (data) => {
                    res.push(data);
                })
                .on('end', () => {
                    expect(res).toHaveLength(3);
                    expect(res[0].titre).toEqual(1);
                    expect(res[0]['définition anglais']).toEqual('A');
                    expect(res[0].toto).toEqual(true);
                    expect(res[1].titre).toEqual(2);
                    expect(res[1]['définition anglais']).toEqual('B');
                    expect(res[1].toto).toEqual(true);
                    expect(res[2].titre).toEqual(3);
                    expect(res[2]['définition anglais']).toEqual('C');
                    expect(res[2].toto).toEqual(true);
                    done();
                });
        });

        it('should labelize each item', (done) => {
            const res = [];
            from(input)
                .pipe(ezs('labelizeFieldID', {
                    connectionStringURI,
                    suffix: true,
                }))
                .on('data', (data) => {
                    res.push(data);
                })
                .on('end', () => {
                    expect(res).toHaveLength(3);
                    expect(res[0]['titre - tfFF']).toEqual(1);
                    expect(res[0]['définition anglais - BoJb']).toEqual('A');
                    expect(res[0].toto).toEqual(true);
                    expect(res[1]['titre - tfFF']).toEqual(2);
                    expect(res[1]['définition anglais - BoJb']).toEqual('B');
                    expect(res[1].toto).toEqual(true);
                    expect(res[2]['titre - tfFF']).toEqual(3);
                    expect(res[2]['définition anglais - BoJb']).toEqual('C');
                    expect(res[2].toto).toEqual(true);
                    done();
                });
        });
    });
});
