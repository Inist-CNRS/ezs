const assert = require('assert');
const from = require('from');
const ezs = require('ezs');

ezs.use(require('../lib'));

describe('sort ', () => {
    it('tune & sort by jaro', (done) => {
        const res = [];
        from([
            { id: 'lorem', value: 8 },
            { id: 'Lorem', value: 7 },
            { id: 'loren', value: 6 },
            { id: 'korem', value: 5 },
            { id: 'olrem', value: 4 },
            { id: 'toto', value: 3 },
            { id: 'titi', value: 2 },
            { id: 'lorem', value: 1 },
        ])
            .pipe(ezs('tune', { path: 'id' }))
            .pipe(ezs('sort'))
            .pipe(ezs('value'))
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(8, res[0].value);
                assert.equal(2, res[7].value);
                assert.equal(8, res.length);
                done();
            });
    });

    it('tune & sort by euclideanVector', (done) => {
        const res = [];
        from([
            { id: 'electrically', value: 1 },
            { id: 'electrician', value: 2 },
            { id: 'electrical fault', value: 3 },
            { id: 'electrical engineering', value: 4 },
            { id: 'electricity', value: 5 },
            { id: 'electrical', value: 6 },
            { id: 'electrical storm', value: 7 },
            { id: 'electric shock', value: 8 },
            { id: 'electrical failure', value: 9 },
            { id: 'electrical engineer', value: 10 },
            { id: 'electric storm', value: 11 },
        ])
            .pipe(ezs('tune', { path: 'id', method: 'euclideanVector' }))
            .pipe(ezs('sort'))
            .pipe(ezs('value'))
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(7, res[0].value);
                assert.equal(9, res[10].value);
                assert.equal(11, res.length);
                done();
            });
    });

    it('tune & sort by numercial', (done) => {
        const res = [];
        from([
            { id: 'un', value: 8 },
            { id: 'deux', value: 10 },
            { id: 'trois', value: 3 },
            { id: 'quatre', value: 4 },
            { id: 'cinq', value: 5 },
            { id: 'six', value: 1 },
            { id: 'sept', value: 2 },
            { id: 'huit', value: 8 },
            { id: 'neuf', value: 5 },
            { id: 'dix', value: 3 },
            { id: 'onze', value: 2 },
        ])
            .pipe(ezs('tune', { path: 'value', method: 'numerical' }))
            .pipe(ezs('sort'))
            .pipe(ezs('value'))
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(11, res.length);
                assert.equal('six', res[0].id);
                assert.equal('deux', res[10].id);
                done();
            });
    });


    it('sort by id', (done) => {
        const res = [];
        from([
            { id: 'electrically', value: 1 },
            { id: 'electrician', value: 2 },
            { id: 'electrical fault', value: 3 },
            { id: 'electrical engineering', value: 4 },
            { id: 'electricity', value: 5 },
            { id: 'electrical', value: 6 },
            { id: 'electrical storm', value: 7 },
            { id: 'electric shock', value: 8 },
            { id: 'electrical failure', value: 9 },
            { id: 'electrical engineer', value: 10 },
            { id: 'electric storm', value: 11 },
        ])
            .pipe(ezs('sort'))
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(1, res[0].value);
                assert.equal(11, res[10].value);
                assert.equal(11, res.length);
                done();
            });
    });

});
