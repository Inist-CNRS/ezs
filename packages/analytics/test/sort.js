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
            .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal('lorem', res[0].id[0]);
                assert.equal('toto', res[5].id[0]);
                assert.equal(8, res.length);
                done();
            });
    });

    it('tune & sort by jaroWinkler', (done) => {
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
            .pipe(ezs('tune', { path: 'id', method: 'ascii' }))
            .pipe(ezs('sort'))
            .pipe(ezs('debug'))
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal('lorem', res[0].id[0]);
                assert.equal('toto', res[5].id[0]);
                assert.equal(8, res.length);
                done();
            });
    });

});
