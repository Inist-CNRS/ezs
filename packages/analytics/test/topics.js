import assert from 'assert';
import from from 'from';
import ezs from '../../core/src';
import statements from '../src';

ezs.addPath(__dirname);

describe('topics', () => {
    it('should return when topics', (done) => {
        ezs.use(statements);
        const res = [];
        from([
            {
                id: 'doc#1',
                value: [
                    'Cats are small.',
                    'Dogs are big.',
                    'Cats like to chase mice.',
                    'Dogs like to eat bones.',
                ],
            },
        ])
            .pipe(ezs('topics'))
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res.push(chunk);
            })
            .on('end', () => {
                expect(res.map((item) => item.term)).toContain('dogs');
                assert.equal(10, res.length);
                done();
            });
    });
});
