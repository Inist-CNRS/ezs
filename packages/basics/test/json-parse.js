import from from 'from';
import ezs from '../../core/src';
import ezsBasics from '../src';

ezs.use(ezsBasics);

describe('JSONParse', () => {
    it('should return a value (jsonstream)', (done) => {
        from(['{ "a": 1 }'])
            .pipe(ezs('JSONParse'))
            .on('data', (data) => {
                expect(data).toBe(1);
            })
            .on('end', () => {
                done();
            });
    });
    it('should return a value (yajs)', (done) => {
        from(['{ "a": 1 }'])
            .pipe(ezs('JSONParse', { legacy: false, separator: "$.a" }))
            .on('data', (data) => {
                expect(data).toBe(1);
            })
            .on('end', () => {
                done();
            });
    });

    it('should return two values (jsonstream)', (done) => {
        let res = [];
        const input = '{ "a": 1 }{ "a": 2 }';
        from(input.split(''))
            .pipe(ezs('JSONParse'))
            .on('data', (data) => {
                expect(typeof data).toBe('number');
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toStrictEqual([1, 2]);
                done();
            });
    });

    it('should return two values (yajs)', (done) => {
        let res = [];
        const input = '{ "a": 1 }{ "a": 2 }';
        from(input.split(''))
            .pipe(ezs.toBuffer())
            .pipe(ezs('JSONParse', { legacy: false, separator: '$.a' }))
            .on('error', done)
            .on('data', (data) => {
                expect(typeof data).toBe('number');
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toStrictEqual([1, 2]);
                done();
            });
    });

    it('should return two objects (jsonstream)', (done) => {
        const res = [];
        const input = '[{ "a": 1 },{ "a": 2 }]';
        from(input.split(''))
            .pipe(ezs.toBuffer())
            .pipe(ezs('JSONParse', { legacy: true, separator: '*' }))
            .on('error', done)
            .on('data', (data) => {
                res.push(data);
            })
            .on('end', () => {
                expect(res.length).toStrictEqual(2);
                expect(res[0].a).toStrictEqual(1);
                expect(res[1].a).toStrictEqual(2);
                done();
            });
    });

    it('should return two objects (yajs)', (done) => {
        const res = [];
        const input = '[{ "a": 1 },{ "a": 2 }]';
        from(input.split(''))
            .pipe(ezs.toBuffer())
            .pipe(ezs('JSONParse', { legacy: false, separator: '$' }))
            .on('error', done)
            .on('data', (data) => {
                res.push(data);
            })
            .on('end', () => {
                expect(res.length).toStrictEqual(2);
                expect(res[0].a).toStrictEqual(1);
                expect(res[1].a).toStrictEqual(2);
                done();
            });
    });


    it('should use the separator (jsonstream)', (done) => {
        let res = [];
        from(['{ "a": 1, "b": 3 }', '{ "a": 2, "b": 4 }'])
            .pipe(ezs('JSONParse', { separator: 'b' }))
            .on('data', (data) => {
                expect(typeof data).toBe('number');
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toStrictEqual([3, 4]);
                done();
            });
    });
});
