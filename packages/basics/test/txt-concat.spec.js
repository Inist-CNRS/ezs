import from from 'from';
import ezs from '../../core/src';
import ezsBasics from '../src';

ezs.use(ezsBasics);

describe('TXTConcat', () => {
    it('should return a string', (done) => {
        from(['a'])
            .pipe(ezs('TXTConcat'))
            .on('data', (data) => {
                expect(data).toBe('a');
            })
            .on('end', () => {
                done();
            });
    });

    it('should concatenate two strings', (done) => {
        from(['a', 'b'])
            .pipe(ezs('TXTConcat'))
            .on('data', (data) => {
                expect(typeof data).toBe('string');
                expect(data).toBe('ab');
            })
            .on('end', () => {
                done();
            });
    });
});
