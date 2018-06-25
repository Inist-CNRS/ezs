const assert = require('assert');
const from = require('from');
const ezs = require('ezs');

ezs.use(require('../lib'));

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
                assert.equal('dogs', res[0].term);
                assert.equal(10, res.length);
                done();
            });
    });
});
