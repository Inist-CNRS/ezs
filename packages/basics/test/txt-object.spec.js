import from from 'from';
import ezs from '../../core/src';
import ezsBasics from '../src';

ezs.use(ezsBasics);

describe('TXTObject', () => {
    it('should return an error when using a non-string key', (done) => {
        from([1])
            .pipe(ezs('TXTObject', { key: [2] }))
            .pipe(ezs.catch((error) => {
                expect(error).toBeDefined();
                expect(error).toBeInstanceOf(Error);
                done();
            }));
    });

    it('should generate an object', (done) => {
        from([1])
            .pipe(ezs('TXTObject'))
            .on('data', (data) => {
                expect(typeof data).toBe('object');
                expect(data).toStrictEqual({ value: 1 });
            })
            .on('end', () => {
                done();
            });
    });

    it('should generate two objects', (done) => {
        let res = [];
        from([1, 'b'])
            .pipe(ezs('TXTObject'))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toStrictEqual([{ value: 1 }, { value: 'b' }]);
                done();
            });
    });

    it('should use the key parameter', (done) => {
        let res = [];
        from([1, 'b'])
            .pipe(ezs('TXTObject', { key: 'data' }))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toStrictEqual([{ data: 1 }, { data: 'b' }]);
                done();
            });
    });
});
