const assert = require('assert');
const from = require('from');
const ezs = require('ezs');

ezs.use(require('../lib'));

describe('flattenPatch', () => {
    it('should return when joined arrays', (done) => {
        const res = [];
        from([
            {
                a: 1,
                'b/0': 2,
                'b/1': 3,
                c: 4,
            },
            {
                'b/0': 1,
                'b/1': 2,
                'b/2': 3,
                'b/3': 4,
            },
        ])
            .pipe(ezs('flattenPatch'))
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(2, res.length);
                assert.equal(1, res[0].a);
                assert.equal('2;3', res[0].b);
                assert.equal(4, res[0].c);
                assert.equal('1;2;3;4', res[1].b);
                done();
            });
    });
});
