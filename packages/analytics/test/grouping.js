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


    it('by modulo #1', (done) => {
        const res = [];
        from([
            { a: 1934 },
            { a: 1936 },
            { a: 1950 },
            { a: 1951 },
            { a: 1952 },
            { a: 1976 },
            { a: 1980 },
            { a: 1981 },
        ])
            .pipe(ezs('distinct', { path: 'a' }))
            .pipe(ezs('groupingByModulo', {
                modulo: 10,
            }))
            .pipe(ezs('summing'))
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(1930, res[0].id[0]);
                assert.equal(2, res[0].value);
                assert.equal(4, res.length);
                done();
            });
    });

    it('by modulo #2', (done) => {
        const res = [];
        from([
            { a: '1934' },
            { a: 1936 },
            { a: 1950 },
            { a: 1951 },
            { a: 1952 },
            { a: 1976 },
            { a: 1980 },
            { a: 1981 },
        ])
            .pipe(ezs('distinct', { path: 'a' }))
            .pipe(ezs('groupingByModulo', {
                modulo: 100,
            }))
            .pipe(ezs('summing'))
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(1900, res[0].id[0]);
                assert.equal(8, res[0].value);
                assert.equal(1, res.length);
                done();
            });
    });


});
