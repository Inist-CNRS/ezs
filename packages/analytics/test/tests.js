const assert = require('assert');
const from = require('from');
const ezs = require('ezs');

ezs.use(require('../lib'));

describe('test', () => {
    it('distinct', (done) => {
        const res = [];
        from([
            { a: 'x', b: 'z' },
            { a: 't', b: 'z' },
            { a: 't', b: 'z' },
            { a: 'x', b: 'z' },
            { a: 'x', b: 'z' },
        ])
            .pipe(ezs('distinct', { path: 'a' }))
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(5, res.length);
                assert.equal('x', res[0].id);
                assert.equal(1, res[0].value);
                assert.equal('t', res[1].id);
                assert.equal(1, res[1].value);
                done();
            });
    });
    it('reducing', (done) => {
        const res = [];
        from([
            { a: 'x', b: 'z' },
            { a: 't', b: 'z' },
            { a: 't', b: 'z' },
            { a: 'x', b: 'z' },
            { a: 'x', b: 'z' },
        ])
            .pipe(ezs('distinct', { path: 'a' }))
            .pipe(ezs('reducing'))
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(2, res.length);
                assert.equal(2, res[0].value.length);
                assert.equal(3, res[1].value.length);
                done();
            });
    });
    it('summing', (done) => {
        const res = [];
        from([
            { a: 'x', b: 'z' },
            { a: 't', b: 'z' },
            { a: 't', b: 'z' },
            { a: 'x', b: 'z' },
            { a: 'x', b: 'z' },
        ])
            .pipe(ezs('distinct', { path: 'a' }))
            .pipe(ezs('reducing'))
            .pipe(ezs('summing'))
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(2, res.length);
                assert.equal(2, res[0].value);
                assert.equal(3, res[1].value);
                done();
            });
    });
    it('combining', (done) => {
        const res = [];
        from([
            { id: 'x', value: 2 },
            { id: 't', value: 2 },
            { id: 'x', value: 3 },
            { id: 'x', value: 5 },
        ])
            .pipe(ezs('reducing'))
            .pipe(ezs('summing'))
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(2, res.length);
                assert.equal(2, res[0].value);
                assert.equal(10, res[1].value);
                done();
            });
    });
    it('count', (done) => {
        const res = [];
        from([
            { a: 'x', b: 'z' },
            { a: 't', b: 'z' },
            { a: 't', b: 'z' },
            { c: 'x', b: 'z' },
            { a: 'x', b: 'z' },
        ])
            .pipe(ezs('count', { path: 'a' }))
            .pipe(ezs('reducing'))
            .pipe(ezs('summing'))
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(1, res.length);
                assert.equal(4, res[0].value);
                done();
            });
    });
    it('pluck', (done) => {
        const res = [];
        from([
            { a: ['m', 'n', 'o'] },
            { a: ['p', 'q', 'r'] },
            { a: ['s', 't', 'u'] },
            { b: ['y', 'd', 'z'] },
            { b: ['x', 'b', 'z'] },
            { c: ['x', 'b', 'z'] },
        ])
            .pipe(ezs('pluck', { path: ['a', 'b'] }))
            .pipe(ezs('reducing'))
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(2, res.length);
                assert.equal(9, res[0].value.length);
                done();
            });
    });
    it('keys', (done) => {
        const res = [];
        from([
            { a: 1, b: 2 },
            { a: 1, c: 3 },
            { a: 2, d: 4 },
            { b: 1, c: 5 },
            { b: 4, d: 6 },
            { c: 1 },
        ])
            .pipe(ezs('keys'))
            .pipe(ezs('reducing'))
            .pipe(ezs('summing'))
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(4, res.length);
                assert.equal(3, res[0].value);
                done();
            });
    });

    it('maximizing', (done) => {
        const res = [];
        from([
            { id: 1, value: [2, 3, 4, 5, 1] },
            { id: 1, value: [2, 6, 4, 5, 1] },
            { id: 1, value: [2, 3, 7, 5, 1] },
            { id: 1, value: [2, 3, 4, 8, 1] },
            { id: 1, value: [9, 3, 4, 5, 1] },
            { id: 1, value: [2, 3, 4, 5, 10] },
        ])
            .pipe(ezs('maximizing'))
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(6, res.length);
                assert.equal(5, res[0].value);
                done();
            });
    });

    it('minimizing', (done) => {
        const res = [];
        from([
            { id: 1, value: [2, 3, 4, 5, 1] },
            { id: 1, value: [2, 6, 4, 5, 1] },
            { id: 1, value: [2, 3, 7, 5, 1] },
            { id: 1, value: [2, 3, 4, 8, 1] },
            { id: 1, value: [9, 3, 4, 5, 1] },
            { id: 1, value: [2, 3, 4, 5, 10] },
        ])
            .pipe(ezs('minimizing'))
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(6, res.length);
                assert.equal(1, res[0].value);
                done();
            });
    });

    it('merging #1', (done) => {
        const res = [];
        from([
            { id: 1, value: { a: 1 } },
            { id: 2, value: { b: 1 } },
            { id: 1, value: { c: 1 } },
            { id: 2, value: { d: 1 } },
            { id: 1, value: { e: 1 } },
            { id: 1, value: { f: 1 } },
        ])
            .pipe(ezs('reducing'))
          .pipe(ezs('merging'))
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(2, res.length);
                assert.equal(1, res[0].value.a);
                assert.equal(1, res[0].value.c);
                assert.equal(1, res[0].value.e);
                assert.equal(1, res[0].value.f);
                assert.equal(1, res[1].value.b);
                assert.equal(1, res[1].value.d);
                done();
            });
    });

    it('merging #2', (done) => {
        const commands = `
            [replace]
            path = id
            value = get('a')
            path = value.b1
            value = get('b1')
            path = value.b2
            value = get('b2')
            path = value.c1
            value = get('c1')
            path = value.c2
            value = get('c2')

            [reducing]
            id = id
            value = value

            [merging]

        `;
        const res = [];
        from([
            { a: 'lorem', b1: 'consectetur', c1: 1 },
            { a: 'lorem', b1: 'adipiscing', c1: 4 },
            { a: 'lorem', b1: 'dolor', c1: 2 },
            { a: 'ipsum', b1: 'consectetur', c1: 3 },
            { a: 'ipsum', b1: 'adipiscing', c1: 5 },
            // -----------------------
            { a: 'lorem', b2: '2018', c2: 1 },
            { a: 'lorem', b2: '2016', c2: 2 },
            { a: 'lorem', b2: '2015', c2: 3 },
            { a: 'ipsum', b2: '2017', c2: 5 },
            { a: 'ipsum', b2: '2018', c2: 3 },
            { a: 'ipsum', b2: '2015', c2: 2 },

        ])
            .pipe(ezs.fromString(commands))
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(2, res.length);
                assert.equal('lorem', res[1].id);
                assert.equal(3, res[1].value.b1.length);
                assert.equal(3, res[1].value.b2.length);
                assert.equal('ipsum', res[0].id);
                assert.equal(2, res[0].value.b1.length);
                assert.equal(3, res[0].value.b2.length);
                done();
            });
    });


    it('totalize', (done) => {
        const res = [];
        from([
            { a: '1', b: '4' },
            { a: '2', b: '4' },
            { a: '1', b: '2' },
            { a: '3', b: '5' },
            { a: '3', b: '5' },
        ])
            .pipe(ezs('pluck', { path: ['a', 'b'] }))
            .pipe(ezs('reducing'))
            .pipe(ezs('summing'))
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(2, res.length);
                assert.equal(10, res[0].value);
                assert.equal(20, res[1].value);
                done();
            });
    });

    it.skip('exploding', (done) => {
        const commands = `
            [exploding]
            id = id
            value = value

            [assign]
            path = value.id
            value = get('id')

            [extract]
            path = value

            [debug]

        `;
        const res = [];
        from([
            { id: 'lorem',
                value: [
                    { b1: 'consectetur', b2: undefined, c1: 1, c2: undefined },
                    { b1: 'adipiscing', b2: undefined, c1: 4, c2: undefined },
                    { b1: 'dolor', b2: undefined, c1: 2, c2: undefined },
                    { b1: undefined, b2: '2018', c1: undefined, c2: 1 },
                    { b1: undefined, b2: '2016', c1: undefined, c2: 2 },
                    { b1: undefined, b2: '2015', c1: undefined, c2: 3 },
                ],
            },
            { id: 'ipsum',
                value: [
                    { b1: 'consectetur', b2: undefined, c1: 3, c2: undefined },
                    { b1: 'adipiscing', b2: undefined, c1: 5, c2: undefined },
                    { b1: undefined, b2: '2017', c1: undefined, c2: 5 },
                    { b1: undefined, b2: '2018', c1: undefined, c2: 3 },
                    { b1: undefined, b2: '2015', c1: undefined, c2: 2 },
                ],
            },
        ])
            .pipe(ezs.fromString(commands))
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(2, res.length);
                done();
            });
    });

    it('split & count', (done) => {
        const commands = `
            [replace]
            path = id
            value = a
            path = value
            value = get('a').split(' ')

            [exploding]
            id = id
            value = value

            [distinct]
            path = value

            [reducing]
            id = id
            value = value

            [summing]
            id = id
            value = value
        `;
        const res = [];
        from([
            { a: 'lorem ipsum dolor sit amet' },
            { a: 'consectetur adipiscing elit' },
            { a: 'Fusce in sem malesuada' },
            { a: 'adipiscing elit sit amet' },
            { a: 'consectetur adipiscing lorem ipsum dolor sit amet' },
        ])
            .pipe(ezs.fromString(commands))
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(12, res.length);
                assert.equal('lorem', res[8].id);
                assert.equal(2, res[8].value);
                done();
            });
    });
});
