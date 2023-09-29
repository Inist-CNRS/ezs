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

    it('should generate with a separator parameter', (done) => {
        let res = [];
        from(['a*b*', 'c*d*'])
            .pipe(ezs('TXTParse', { separator: '*' }))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toStrictEqual(['a', 'b', 'c', 'd']);
                done();
            });
    });
    it('should generate with a separator parameter and multi bytes char', (done) => {
        let res = [];
        from([
            'a*b*',
            Buffer.from([0xE2]),
            Buffer.from([0x82]),
            Buffer.from([0xAC]),
            '*',
            Buffer.from([0xC2]),
            Buffer.from([0xA2]),
        ])
            .pipe(ezs('TXTParse', { separator: '*' }))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toStrictEqual(['a', 'b', '€', '¢']);
                done();
            });
    });



    it('should not generate with a tab separator', (done) => {
        let res = [];
        from(['a\tb\t', 'c\td\t'])
            .pipe(ezs('TXTParse', { separator: '\t' }))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toStrictEqual([]);
                done();
            });
    });
});
