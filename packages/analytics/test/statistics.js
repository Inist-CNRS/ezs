import from from 'from';
import ezs from '../../core/src';
import statements from '../src';

ezs.addPath(__dirname);

describe('statistics', () => {
    it('of 1 value', (done) => {
        ezs.use(statements);
        from([{ a: 1 }])
            .pipe(ezs('statistics', { path: 'a', target: 'statistics' }))
            .pipe(ezs.catch((e) => done(e)))
            .on('data', (chunk) => {
                expect(chunk.statistics.a.count).toEqual(1);
                expect(chunk.statistics.a.sum).toEqual(1);
                expect(chunk.statistics.a.population).toEqual(1);
                expect(chunk.statistics.a.sample).toEqual(1);
            })
            .on('end', () => {
                done();
            });
    });
    it('of 1 unknown value', (done) => {
        ezs.use(statements);
        from([{ total: 0 }])
            .pipe(ezs('statistics', { path: 'a', target: 'statistics' }))
            .pipe(ezs.catch((e) => done(e)))
            .on('data', (chunk) => {
                expect(chunk.statistics.a).toBeUndefined();
            })
            .on('end', () => {
                done();
            });
    });

    it('of 1 number fields', (done) => {
        ezs.use(statements);
        from([
            { a: 1 },
            { a: 1 },
            { a: 1 },
            { a: 1 },
            { a: 1 },
        ])
            .pipe(ezs('statistics', { path: 'a', target: 'statistics' }))
            .pipe(ezs.catch((e) => done(e)))
            .on('data', (chunk) => {
                expect(chunk.statistics.a.count).toEqual(5);
                expect(chunk.statistics.a.sum).toEqual(5);
                expect(chunk.statistics.a.population).toEqual(1);
                expect(chunk.statistics.a.sample).toEqual(5);
            })
            .on('end', () => {
                done();
            });
    });

    it('of 1 number fields (bis)', (done) => {
        ezs.use(statements);
        from([
            { a: 1 },
            { a: 2 },
            { a: 2 },
            { a: 2 },
            { a: 3 },
        ])
            .pipe(ezs('statistics', { path: 'a', target: 'statistics' }))
            .pipe(ezs.catch((e) => done(e)))
            .on('data', (chunk) => {
                expect(chunk.statistics.a.count).toEqual(5);
                expect(chunk.statistics.a.sum).toEqual(10);
                expect(chunk.statistics.a.mean).toEqual(2);
                expect(chunk.statistics.a.range).toEqual(2);
                expect(chunk.statistics.a.midrange).toEqual(1);
                expect(chunk.statistics.a.variance).toEqual(0.4);
                expect(chunk.statistics.a.deviation).toEqual(0.6324555320336759);
                expect(chunk.statistics.a.population).toEqual(3);
            })
            .on('end', () => {
                done();
            });
    });

    it('of 2 numbers fields', (done) => {
        ezs.use(statements);
        from([
            { a: 1, b: 2 },
            { a: 1, b: 2 },
            { a: 1, b: 2 },
            { a: 1, b: 2 },
            { a: 1, b: 2 },
        ])
            .pipe(ezs('statistics', { path: ['a', 'b'], target: 'statistics' }))
            .pipe(ezs.catch((e) => done(e)))
            .on('data', (chunk) => {
                expect(chunk.statistics.a.count).toEqual(5);
                expect(chunk.statistics.a.sum).toEqual(5);
                expect(chunk.statistics.a.population).toEqual(1);
                expect(chunk.statistics.a.sample).toEqual(5);
                expect(chunk.statistics.b.sum).toEqual(10);
                expect(chunk.statistics.b.population).toEqual(1);
                expect(chunk.statistics.b.count).toEqual(5);
                expect(chunk.statistics.b.sample).toEqual(5);
            })
            .on('end', () => {
                done();
            });
    });

    it('of 2 numbers fields', (done) => {
        ezs.use(statements);
        from([
            { a: 1, b: 2 },
            { a: 1, b: 2 },
            { a: 1, b: 2 },
            { a: 1 },
            { a: 1, b: 2 },
        ])
            .pipe(ezs('statistics', { path: ['a', 'b'], target: 'statistics' }))
            .pipe(ezs.catch((e) => done(e)))
            .on('data', (chunk) => {
                expect(chunk.statistics.a.count).toEqual(5);
                expect(chunk.statistics.a.sum).toEqual(5);
                expect(chunk.statistics.a.population).toEqual(1);
                expect(chunk.statistics.a.sample).toEqual(5);
                if (chunk.b) {
                    expect(chunk.statistics.b.sample).toEqual(4);
                    expect(chunk.statistics.b.sum).toEqual(8);
                    expect(chunk.statistics.b.population).toEqual(1);
                    expect(chunk.statistics.b.count).toEqual(4);
                } else {
                    expect(chunk.statistics.b).toBeUndefined();
                }
            })
            .on('end', () => {
                done();
            });
    });

    it('of 1 string fields', (done) => {
        ezs.use(statements);
        from([
            { a: 'z' },
            { a: 'z' },
            { a: 'z' },
            { a: 'z' },
            { a: 'z' },
        ])
            .pipe(ezs('statistics', { path: 'a', target: 'statistics' }))
            .pipe(ezs.catch((e) => done(e)))
            .on('data', (chunk) => {
                expect(chunk.statistics.a.count).toEqual(5);
                expect(chunk.statistics.a.sum).toEqual(0);
                expect(chunk.statistics.a.sample).toEqual(5);
                expect(chunk.statistics.a.population).toEqual(1);
            })
            .on('end', () => {
                done();
            });
    });

    it('of 1 string fields (bis)', (done) => {
        ezs.use(statements);
        from([
            { a: 'z' },
            { a: 'y' },
            { a: 'z' },
            { a: 'y' },
            { a: 'y' },
        ])
            .pipe(ezs('statistics', { path: 'a', target: 'statistics' }))
            .pipe(ezs.catch((e) => done(e)))
            .on('data', (chunk) => {
                expect(chunk.statistics.a.sum).toEqual(0);
                expect(chunk.statistics.a.population).toEqual(2);
                if (chunk.a === 'z') {
                    expect(chunk.statistics.a.sample).toEqual(2);
                } else {
                    expect(chunk.statistics.a.sample).toEqual(3);
                }
            })
            .on('end', () => {
                done();
            });
    });

    it('for percentage', (done) => {
        ezs.use(statements);
        let res = 0;
        from([
            { a: 2 },
            { a: 3 },
            { a: 1 },
            { a: 4 },
        ])
            .pipe(ezs('statistics', { path: 'a', target: 'statistics' }))
            .pipe(ezs.catch((e) => done(e)))
            .on('data', (chunk) => {
                res += chunk.statistics.a.percentage;
            })
            .on('end', () => {
                expect(res).toEqual(100);
                done();
            });
    });
});
