import ezs from 'ezs';
import from from 'from';
import statements from '../src';

ezs.use(statements);

describe('extractIstexQuery', () => {
    it('should return when no istexQuery', (done) => {
        from([{}])
            .pipe(ezs('extractIstexQuery', {
                fields: [],
                labels: [''],
            }))
            .on('data', () => {
                done(new Error('should return null'));
            })
            .on('end', done);
    });

    it('should return a query', (done) => {
        from([{
            uri: 'http://uri',
            istexQuery: 'dumb',
        }])
            .pipe(ezs('extractIstexQuery', {
                fields: [
                    {
                        name: 'istexQuery',
                        scheme: 'istex:query',
                    },
                ],
                labels: ['query'],
            }))
            .pipe(ezs((output) => {
                try {
                    expect(output).toEqual({
                        content: 'dumb',
                        lodex: {
                            uri: 'http://uri',
                        },
                    });
                    done();
                } catch (e) {
                    done(e);
                }
            }));
    });

    it('should return a query with expanded scheme', (done) => {
        from([{
            uri: 'http://uri',
            istexQuery: 'dumb',
        }])
            .pipe(ezs('extractIstexQuery', {
                fields: [
                    {
                        name: 'istexQuery',
                        scheme: 'https://data.istex.fr/ontology/istex#query',
                    },
                ],
                labels: ['query'],
            }))
            .pipe(ezs((output) => {
                try {
                    expect(output).toEqual({
                        content: 'dumb',
                        lodex: {
                            uri: 'http://uri',
                        },
                    });
                    done();
                } catch (e) {
                    done(e);
                }
            }));
    });

    it('should return a query without instance number', (done) => {
        from([{
            uri: 'http://p-s-1.uri',
            istexQuery: 'dumb',
        }])
            .pipe(ezs('extractIstexQuery', {
                fields: [
                    {
                        name: 'istexQuery',
                        scheme: 'istex:query',
                    },
                ],
                labels: ['query'],
            }))
            .pipe(ezs((output) => {
                try {
                    expect(output).toEqual({
                        content: 'dumb',
                        lodex: {
                            uri: 'http://p-s.uri',
                        },
                    });
                    done();
                } catch (e) {
                    done(e);
                }
            }));
    });
});
