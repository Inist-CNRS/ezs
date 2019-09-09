import from from 'from';
import ezs from '../../core/src';
import ezsBasics from '../src';

ezs.use(ezsBasics);

describe('TXTParse', () => {
    it('should return a string', (done) => {
        from(['a'])
            .pipe(ezs('TXTParse'))
            .on('data', (data) => {
                expect(typeof data).toBe('string');
                expect(data).toBe('a');
            })
            .on('end', () => {
                done();
            });
    });

    it('should generate two values', (done) => {
        let res = [];
        from(['a\nb\n'])
            .pipe(ezs('TXTParse'))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toStrictEqual(['a', 'b']);
                done();
            });
    });

    it('should return an empty string when input is not a string', (done) => {
        let res = [];
        from([{}])
            .pipe(ezs('TXTParse'))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toStrictEqual(['']);
                done();
            });
    });

    it('should generate two values from a Buffer', (done) => {
        let res = [];
        from([Buffer.from('a\nb\n')])
            .pipe(ezs('TXTParse'))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toStrictEqual(['a', 'b']);
                done();
            });
    });

    it('should generate from several chunks', (done) => {
        let res = [];
        from(['a\nb\n', 'c\nd\n'])
            .pipe(ezs('TXTParse'))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toStrictEqual(['a', 'b', 'c', 'd']);
                done();
            });
    });
});
