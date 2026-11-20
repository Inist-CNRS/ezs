import assert from 'assert';
import from from 'from';
import ezs from '../src/index.js';

describe('exchange', () => {
    it('without value parameter: sends an empty array', (done) => {
        const res = [];
        from(['a', 'b'])
            .pipe(ezs('exchange'))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 2);
                res.forEach((chunk) => assert.deepEqual(chunk, []));
                done();
            });
    });
    it('with a single value: sends the value', (done) => {
        const res = [];
        from(['a'])
            .pipe(ezs('exchange', { value: 'X' }))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 1);
                assert.equal(res[0], 'X');
                done();
            });
    });
    it('with a single value in an array: sends the value', (done) => {
        const res = [];
        from(['a'])
            .pipe(ezs('exchange', { value: ['X'] }))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 1);
                assert.equal(res[0], 'X');
                done();
            });
    });
    it('with several values: sends the array of values', (done) => {
        const res = [];
        from(['a'])
            .pipe(ezs('exchange', { value: ['X', 'Y', 'Z'] }))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 1);
                assert.deepEqual(res[0], ['X', 'Y', 'Z']);
                done();
            });
    });
});
