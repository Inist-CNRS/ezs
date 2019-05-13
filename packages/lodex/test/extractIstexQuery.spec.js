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
            .pipe(ezs((output, feed) => {
                feed.close();
                try {
                    expect(output).toBe(null);
                    done();
                } catch (e) {
                    done(e);
                }
            }));
    });

    it('should return null if no label matches the query field', (done) => {
        from([{}])
            .pipe(ezs('extractIstexQuery', {
                fields: [
                    {
                        name: 'istexQuery',
                        label: 'query',
                        format: {
                            name: 'istex',
                        },
                    },
                ],
                labels: ['foo'],
            }))
            .pipe(ezs((output, feed) => {
                feed.close();
                try {
                    expect(output).toBe(null);
                    done();
                } catch (e) {
                    done(e);
                }
            }));
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
                        label: 'query',
                        format: {
                            name: 'istex',
                        },
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
                        label: 'query',
                        format: {
                            name: 'istex',
                        },
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
