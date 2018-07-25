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
                assert.equal(10, res[0].value);
                assert.equal(1, res[10].value);
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


    it('sort by id #2', (done) => {
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


    it('sort by id #2', (done) => {
        const res = [];
        from([
            { "i": 1, "value": 1, },
            { "i": 3.879032258064517, "value": 2 },
            { "i": 2.516129032258065, "value": 3 },
            { "i": 1.0000000000000002, "value": 4 },
            { "i": 0.2016129032258065, "value": 5 },
            { "i": 0.45161290322580655, "value": 6 },
            { "i": 2.516129032258065, "value": 7 },
            { "i": 0.49731182795698936, "value": 8 },
            { "i": 2.6102150537634414, "value": 9 },
            { "i": 2.6102150537634414, "value": 10 },
            { "i": 0.45161290322580655, "value": 11 },
            { "i": 0.924731182795699, "value": 12 },
            { "i": 1.3575268817204302, "value": 13 },
            { "i": 2.610215053763441, "value": 14 },
            { "i": 0.45161290322580644, "value": 15 },
            { "i": 0.45161290322580644, "value": 16 },
            { "i": 2.524193548387097, "value": 17 },
            { "i": 1.0430107526881722, "value": 18 },
            { "i": 0.6182795698924732, "value": 19 },
            { "i": 0.817204301075269, "value": 20 }
        ])
            .pipe(ezs('sort', { path: 'i' }))
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(20, res.length);
                assert.equal(5, res[0].value);
                assert.equal(2, res[19].value);
                done();
            });
    });



});
