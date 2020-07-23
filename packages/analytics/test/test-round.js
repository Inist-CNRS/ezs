const assert = require('assert');
const from = require('from');
const ezs = require('../../core/src');


ezs.use(require('../src'));


describe('test-round', () => {
    it('round', (done) => {
        const res = [];
        from([
            { id: 'x', value: 2.2 },
            { id: 'y', value: 2.5 },
            { id: 'z', value: 2.8 },
        ])

            .pipe(ezs('round', { path: 'value' }))
            .on('data', (chunk) => {
                res.push(chunk);
                // console.log(`res : ${res[0]} ${res[1]} ${res[2]}`);
            })
            .on('end', () => {
                assert.equal(res[0], 2);
                assert.equal(res[1], 3);
                assert.equal(res[2], 3);
                done();
            });
    });
    it('round default', (done) => {
        const res = [];
        from([
            { id: 'x', value: 2.2 },
            { id: 'y', value: 2.5 },
            { id: 'z', value: 2.8 },
        ])

            .pipe(ezs('round', { path: 'value', type: 'default' }))
            .on('data', (chunk) => {
                res.push(chunk);
                // console.log(`res : ${res[0]} ${res[1]} ${res[2]}`);
            })
            .on('end', () => {
                assert.equal(res[0], 2);
                assert.equal(res[1], 2);
                assert.equal(res[2], 2);
                done();
            });
    });
    it('round excess', (done) => {
        const res = [];
        from([
            { id: 'x', value: 2.2 },
            { id: 'y', value: 2.5 },
            { id: 'z', value: 2.8 },
        ])

            .pipe(ezs('round', { path: 'value', type: 'excess' }))
            .on('data', (chunk) => {
                res.push(chunk);
                // console.log(`res : ${res[0]} ${res[1]} ${res[2]}`);
            })
            .on('end', () => {
                assert.equal(res[0], 3);
                assert.equal(res[1], 3);
                assert.equal(res[2], 3);
                done();
            });
    });
});
