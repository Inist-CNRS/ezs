const from = require('from');
const ezs = require('../../core/src');

ezs.use(require('../src'));

describe('statistics', () => {
    it('of 1 number fields', (done) => {
        from([
            { a: 1 },
            { a: 1 },
            { a: 1 },
            { a: 1 },
            { a: 1 },
        ])
            .pipe(ezs('statistics', { path: 'a', target: 'statistics' }))
            .on('data', (chunk) => {
                expect(chunk.statistics.a.count).toEqual(5);
                expect(chunk.statistics.a.sum).toEqual(5);
                expect(chunk.statistics.a.csize).toEqual(1);
                expect(chunk.statistics.a.size).toEqual(5);
            })
            .on('end', () => {
                done();
            });
    });

    it('of 1 number fields (bis)', (done) => {
        from([
            { a: 1 },
            { a: 2 },
            { a: 2 },
            { a: 2 },
            { a: 3 },
        ])
            .pipe(ezs('statistics', { path: 'a', target: 'statistics' }))
            .on('data', (chunk) => {
                expect(chunk.statistics.a.count).toEqual(5);
                expect(chunk.statistics.a.sum).toEqual(10);
                expect(chunk.statistics.a.mean).toEqual(2);
                expect(chunk.statistics.a.range).toEqual(2);
                expect(chunk.statistics.a.midrange).toEqual(1);
                expect(chunk.statistics.a.variance).toEqual(0.4);
                expect(chunk.statistics.a.deviation).toEqual(0.6324555320336759);
                expect(chunk.statistics.a.csize).toEqual(3);
            })
            .on('end', () => {
                done();
            });
    });



    it('of 2 numbers fields', (done) => {
        from([
            { a: 1, b: 2 },
            { a: 1, b: 2 },
            { a: 1, b: 2 },
            { a: 1, b: 2 },
            { a: 1, b: 2 },
        ])
            .pipe(ezs('statistics', { path: ['a', 'b'], target: 'statistics' }))
            .on('data', (chunk) => {
                expect(chunk.statistics.a.count).toEqual(5);
                expect(chunk.statistics.a.sum).toEqual(5);
                expect(chunk.statistics.a.csize).toEqual(1);
                expect(chunk.statistics.a.size).toEqual(5);
                expect(chunk.statistics.b.sum).toEqual(10);
                expect(chunk.statistics.b.csize).toEqual(1);
                expect(chunk.statistics.b.count).toEqual(5);
                expect(chunk.statistics.b.size).toEqual(5);
            })
            .on('end', () => {
                done();
            });
    });

    it('of 2 numbers fields', (done) => {
        from([
            { a: 1, b: 2 },
            { a: 1, b: 2 },
            { a: 1, b: 2 },
            { a: 1 },
            { a: 1, b: 2 },
        ])
            .pipe(ezs('statistics', { path: ['a', 'b'], target: 'statistics' }))
            .on('data', (chunk) => {
                expect(chunk.statistics.a.count).toEqual(5);
                expect(chunk.statistics.a.sum).toEqual(5);
                expect(chunk.statistics.a.csize).toEqual(1);
                expect(chunk.statistics.a.size).toEqual(5);
                if (chunk.b) {
                    expect(chunk.statistics.b.size).toEqual(4);
                    expect(chunk.statistics.b.sum).toEqual(8);
                    expect(chunk.statistics.b.csize).toEqual(1);
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
        from([
            { a: 'z' },
            { a: 'z' },
            { a: 'z' },
            { a: 'z' },
            { a: 'z' },
        ])
            .pipe(ezs('statistics', { path: 'a', target: 'statistics' }))
            .on('data', (chunk) => {
                expect(chunk.statistics.a.count).toEqual(5);
                expect(chunk.statistics.a.sum).toEqual(0);
                expect(chunk.statistics.a.size).toEqual(5);
                expect(chunk.statistics.a.csize).toEqual(1);
            })
            .on('end', () => {
                done();
            });
    });

    it('of 1 string fields (bis)', (done) => {
        from([
            { a: 'z' },
            { a: 'y' },
            { a: 'z' },
            { a: 'y' },
            { a: 'y' },
        ])
            .pipe(ezs('statistics', { path: 'a', target: 'statistics'  }))
            .on('data', (chunk) => {
                expect(chunk.statistics.a.sum).toEqual(0);
                expect(chunk.statistics.a.csize).toEqual(2);
                if (chunk.a === 'z') {
                    expect(chunk.statistics.a.size).toEqual(2);
                } else {
                    expect(chunk.statistics.a.size).toEqual(3);
                }
            })
            .on('end', () => {
                done();
            });
    });
});
