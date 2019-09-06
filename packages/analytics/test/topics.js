const assert = require('assert');
const from = require('from');
const ezs = require('../../core/src');

ezs.use(require('../src'));

describe('topics', () => {
    it('should return when topics', (done) => {
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
