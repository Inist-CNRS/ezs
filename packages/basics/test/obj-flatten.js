import from from 'from';
import ezs from '../../core/src';
import ezsBasics from '../src';

ezs.use(ezsBasics);

describe('OBJFlatten', () => {
    it('should not flatten an level-1 value', (done) => {
        from([{ a: 1 }])
            .pipe(ezs('OBJFlatten'))
            .on('data', (data) => {
                expect(data).toStrictEqual({ a: 1 });
            })
            .on('end', () => {
                done();
            });
    });

    it('should return two objects', (done) => {
        let res = [];
        from([{ a: 1 }, { a: 2 }])
            .pipe(ezs('OBJFlatten'))
            .on('data', (data) => {
                expect(typeof data).toBe('object');
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toStrictEqual([{ a: 1 }, { a: 2 }]);
                done();
            });
    });

    it('should flatten the nested objects', (done) => {
        from([{ a: { b: 1, c: 2 } }])
            .pipe(ezs('OBJFlatten'))
            .on('data', (data) => {
                expect(data).toStrictEqual({ 'a/b': 1, 'a/c': 2 });
            })
            .on('end', () => {
                done();
            });
    });

    it('should use the given separator', (done) => {
        from([{ a: { b: 1, c: 2 } }])
            .pipe(ezs('OBJFlatten', { separator: ':' }))
            .on('data', (data) => {
                expect(data).toStrictEqual({ 'a:b': 1, 'a:c': 2 });
            })
            .on('end', () => {
                done();
            });
    });

    it('should work on several objects', (done) => {
        let res = [];
        from([
            { a: { b: 1, c: 2 } },
            { a: { b: 3, c: 4 } },
        ])
            .pipe(ezs('OBJFlatten'))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toStrictEqual([
                    { 'a/b': 1, 'a/c': 2 },
                    { 'a/b': 3, 'a/c': 4 }]);
                done();
            });
    });
});
