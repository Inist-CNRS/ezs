const assert = require('assert');
const from = require('from');
const ezs = require('ezs');

ezs.use(require('../lib'));

describe('grouping', () => {
    it('by Equality', (done) => {
        const res = [];
        from([
            { a: 'lorem' },
            { a: 'Lorem' },
            { a: 'loren' },
            { a: 'korem' },
            { a: 'olrem' },
            { a: 'toto' },
            { a: 'titi' },
            { a: 'lorem' },
        ])
            .pipe(ezs('distinct', { path: 'a' }))
            .pipe(ezs('groupingByEquality'))
            .pipe(ezs('summing'))
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal('lorem', res[0].id[0]);
                assert.equal(2, res[0].value);
                assert.equal(7, res.length);
                done();
            });
    });

    it('by Levenshtein', (done) => {
        const res = [];
        from([
            { a: 'lorem' },
            { a: 'Lorem' },
            { a: 'loren' },
            { a: 'korem' },
            { a: 'olrem' },
            { a: 'toto' },
            { a: 'titi' },
            { a: 'lorem' },
        ])
            .pipe(ezs('distinct', { path: 'a' }))
            .pipe(ezs('groupingByLevenshtein', {
                distance: 1,
            }))
            .pipe(ezs('summing'))
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal('lorem', res[0].id[0]);
                assert.equal(5, res[0].value);
                assert.equal(4, res.length);
                done();
            });
    });

    it('by Hamming', (done) => {
        const res = [];
        from([
            { a: 'lorem' },
            { a: 'Lorem' },
            { a: 'loren' },
            { a: 'korem' },
            { a: 'olrem' },
            { a: 'toto' },
            { a: 'titi' },
            { a: 'lorem' },
        ])
            .pipe(ezs('distinct', { path: 'a' }))
            .pipe(ezs('groupingByHamming', {
                distance: 1,
            }))
            .pipe(ezs('summing'))
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal('lorem', res[0].id[0]);
                assert.equal(5, res[0].value);
                assert.equal(3, res.length);
                done();
            });
    });
});
