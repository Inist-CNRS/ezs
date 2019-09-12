import from from 'from';
import ezs from '../../core/src';
import ezsBasics from '../src';

ezs.use(ezsBasics);

describe('OBJCount', () => {
    it('should return a number', (done) => {
        from(['a'])
            .pipe(ezs('OBJCount'))
            .on('data', (data) => {
                expect(data).toBe(1);
                expect(typeof data).toBe('number');
                done();
            });
    });

    it('should return the number of chunks', (done) => {
        from(['a', 'b', 'c', 'd'])
            .pipe(ezs('OBJCount'))
            .on('data', (data) => {
                // TODO: check it is really the expected behaviour
                expect(data).toBe(4);
                done();
            });
    });
});
