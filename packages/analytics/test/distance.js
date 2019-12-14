const assert = require('assert');
const from = require('from');
const ezs = require('../../core/src');

ezs.use(require('../src'));

describe('distance', () => {
    it('of 2 array', (done) => {
        const res = [];
        from([
            {
                id_of_a: 1, id_of_b: 2, a: ['x', 'y'], b: ['x', 'z'],
            },
            {
                id_of_a: 1, id_of_b: 3, a: ['x', 'y'], b: ['y', 'z'],
            },
            {
                id_of_a: 1, id_of_b: 4, a: ['x', 'y'], b: ['z'],
            },
            {
                id_of_a: 1, id_of_b: 5, a: ['x', 'y'], b: ['x', 'y', 'z'],
            },
            {
                id_of_a: 1, id_of_b: 6, a: ['x', 'y'], b: ['x', 'y'],
            },
        ])
            .pipe(ezs('distance', { id: ['id_of_a', 'id_of_b'], value: ['a', 'b'] }))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(5, res.length);
                assert.equal(0.5, res[0].value);
                assert.equal(0, res[2].value);
                assert.equal(1, res[4].value);
                done();
            });
    });
    it('of 2 string', (done) => {
        const res = [];
        from([
            {
                id: [1, 2], value: ['karolin', 'kathrin'],
            },
            {
                id: [1, 3], value: ['karolin', 'kerstin'],
            },
            {
                id: [1, 4], value: ['karolin', 'caroline'],
            },
            {
                id: [1, 5], value: ['karolin', 'kaporal'],
            },
            {
                id: [1, 6], value: ['karolin', 'karolin'],
            },
        ])
            .pipe(ezs('distance'))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(5, res.length);
                assert.equal(0.5714285714285714, res[0].value);
                assert.equal(1, res[4].value);
                done();
            });
    });
    it('of 2 number', (done) => {
        const res = [];
        from([
            {
                id: [1, 2], value: [1234, 13444],
            },
            {
                id: [1, 3], value: [0.3445, 0.456612],
            },
            {
                id: [1, 4], value: [563.3434, 423.534],
            },
            {
                id: [1, 5], value: [1, 1],
            },
            {
                id: [1, 6], value: [0, 0],
            },
        ])
            .pipe(ezs('distance'))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(5, res.length);
                assert.equal(0.16825613079019075, res[0].value);
                assert.equal(1.000, res[3].value);
                assert.equal(1.000, res[4].value);
                done();
            });
    });
});
