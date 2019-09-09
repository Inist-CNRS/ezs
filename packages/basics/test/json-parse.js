import from from 'from';
import ezs from '../../core/src';
import ezsBasics from '../src';

ezs.use(ezsBasics);

describe('JSONParse', () => {
    it('should return a value', (done) => {
        from(['{ "a": 1 }'])
            .pipe(ezs('JSONParse'))
            .on('data', (data) => {
                expect(data).toBe(1);
            })
            .on('end', () => {
                done();
            });
    });

    it('should return two values', (done) => {
        let res = [];
        from(['{ "a": 1 }', '{ "a": 2 }'])
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

    it('should use the separator', (done) => {
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
