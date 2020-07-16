const assert = require('assert');
const from = require('from');
const ezs = require('../../core/src');

const data01 = require('./data01.json');

ezs.use(require('../src'));

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
    it('pluck #1', (done) => {
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
    it('pluck #2', (done) => {
        const res = [];
        from([
            { a: 'x', b: 'z' },
            { a: 't', b: 'z' },
            { a: 't', b: 'z' },
            { c: 'x', b: 'z' },
            { a: 'x', b: 'z' },
        ])
            .pipe(ezs('pluck', { path: 'b' }))
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                assert.equal('z', chunk.value);
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(5, res.length);
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
        const script = `
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
            .pipe(ezs('delegate', { script }))
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
        const script = `
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
            {
                id: 'lorem',
                value: [
                    /* eslint-disable object-curly-newline */
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
                    /* eslint-enable object-curly-newline */
                ],
            },
        ])
            .pipe(ezs('delegate', { script }))
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
        const script = `
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
            .pipe(ezs('delegate', { script }))
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

    it('slice #1', (done) => {
        const res = [];
        from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22])
            .pipe(ezs('slice'))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(10, res.length);
                assert.equal(1, res[0]);
                assert.equal(10, res[9]);
                done();
            });
    });

    it('slice #2', (done) => {
        const res = [];
        from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22])
            .pipe(ezs('slice', { start: 2, size: 2 }))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(2, res.length);
                assert.equal(2, res[0]);
                assert.equal(3, res[1]);
                done();
            });
    });

    it('slice #3', (done) => {
        const res = [];
        from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
            .pipe(ezs('slice'))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(10, res.length);
                assert.equal(1, res[0]);
                assert.equal(10, res[9]);
                done();
            });
    });

    it('distribute #1', (done) => {
        const res = [];
        from([
            { a: 1, b: 'a' },
            { a: 3, b: 'b' },
            { a: 4, b: 'c' },
            { a: 3, b: 'd' },
            { a: 2, b: 'e' },
            { a: 11, b: 'f' },
            { a: 5, b: 'g' },
            { a: 1, b: 'h' },
            { a: 8, b: 'i' },
            { a: 9, b: 'j' },
            { a: 7, b: 'k' },
            { a: 10, b: 'l' },
            { a: 12, b: 'm' },
            { a: 6, b: 'n' },
        ])
            // eslint-disable-next-line object-curly-newline
            .pipe(ezs('distribute', { id: 'a', value: 'b', start: 2, size: 10, step: 2 }))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(6, res.length);
                assert.equal('e', res[0].value); // 2
                assert.equal('c', res[1].value); // 4
                assert.equal('n', res[2].value); // 6
                assert.equal('i', res[3].value); // 8
                assert.equal('l', res[4].value); // 10
                assert.equal('m', res[5].value); // 12
                done();
            });
    });

    it('distribute #2', (done) => {
        const res = [];
        from([
            { a: 1, b: 'a' },
            { a: 3, b: 'b' },
            { a: 4, b: 'c' },
            { a: 3, b: 'd' },
            { a: 2, b: 'e' },
            { a: 11, b: 'f' },
            { a: 5, b: 'g' },
            { a: 1, b: 'h' },
            { a: 9, b: 'j' },
            { a: 7, b: 'k' },
            { a: 10, b: 'l' },
            { a: 12, b: 'm' },
        ])
            .pipe(ezs('distribute', {
                id: 'a', value: 'b', start: 2, size: 10, step: 2, default: 'x',
            }))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(6, res.length);
                assert.equal('e', res[0].value); // 2
                assert.equal('c', res[1].value); // 4
                assert.equal('x', res[2].value); // 6
                assert.equal('x', res[3].value); // 8
                assert.equal('l', res[4].value); // 10
                assert.equal('m', res[5].value); // 12
                done();
            });
    });

    it('distribute #3', (done) => {
        const res = [];
        from([
            { id: '2013', value: 8 },
            { id: '2009', value: 6 },
            { id: '2011', value: 7 },
            { id: '2007', value: 5 },
            { id: '2003', value: 3 },
            { id: '2005', value: 4 },
            { id: '2000', value: 1 },
            { id: '2001', value: 2 },
        ])
            .pipe(ezs('distribute', { step: 1 }))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(14, res.length);
                assert.equal(2000, res[0].id);
                assert.equal(2001, res[1].id);
                assert.equal(2002, res[2].id);
                assert.equal(2003, res[3].id);
                assert.equal(2004, res[4].id);
                assert.equal(2005, res[5].id);
                done();
            });
    });

    it('distribute #4', (done) => {
        const res = [];
        from([
            { id: '2013', value: 8 },
            { id: '2009', value: 6 },
            { id: '2011', value: 7 },
            { id: '2007', value: 5 },
            { id: '2003', value: 3 },
            { id: '2005', value: 4 },
            { id: '2000', value: 1 },
            { id: '2001', value: 2 },
        ])
            .pipe(ezs('distribute', { step: 3 }))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(5, res.length);
                assert.equal(2000, res[0].id);
                assert.equal(2003, res[1].id);
                assert.equal(2006, res[2].id);
                assert.equal(2009, res[3].id);
                assert.equal(2012, res[4].id);
                done();
            });
    });

    it('distribute #5', (done) => {
        const res = [];
        from(data01)
            .pipe(ezs('groupingByModulo', { modulo: 1 }))
            .pipe(ezs('summing'))
            .pipe(ezs('distribute', { step: 1, start: 1 }))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(10, res.length);
                done();
            });
    });

    it('greater #1', (done) => {
        const res = [];
        from([
            { id: 2000, value: 1 },
            { id: 2001, value: 2 },
            { id: 2003, value: 3 },
            { id: 2005, value: 4 },
            { id: 2007, value: 5 },
            { id: 2009, value: 6 },
            { id: 2011, value: 7 },
            { id: 2013, value: 8 },
        ])
            .pipe(ezs('greater', { than: 3 }))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(6, res.length);
                assert.equal(2003, res[0].id);
                assert.equal(2013, res[res.length - 1].id);
                done();
            });
    });

    it('greater #2', (done) => {
        const res = [];
        from([
            { id: 2000, value: 1 },
            { id: 2001, value: 2 },
            { id: 2003, value: 3 },
            { id: 2005, value: 4 },
            { id: 2007, value: 5 },
            { id: 2009, value: 6 },
            { id: 2011, value: 7 },
            { id: 2013, value: 8 },
        ])
            .pipe(ezs('greater', { than: 3, strict: true }))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(5, res.length);
                assert.equal(2005, res[0].id);
                assert.equal(2013, res[res.length - 1].id);
                done();
            });
    });

    it('greater #3', (done) => {
        const res = [];
        from([
            { id: 2000, value: 1 },
            { id: 2001, value: 2 },
            { id: 2003, value: 3 },
            { id: 2005, value: 4 },
            { id: 2007, value: 5 },
            { id: 2009, value: 6 },
            { id: 2011, value: 7 },
            { id: 2013, value: 8 },
        ])
            .pipe(ezs('greater', { than: 2005, strict: true, path: 'id' }))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(4, res.length);
                assert.equal(2007, res[0].id);
                assert.equal(2013, res[res.length - 1].id);
                done();
            });
    });

    it('less #1', (done) => {
        const res = [];
        from([
            { id: 2000, value: 1 },
            { id: 2001, value: 2 },
            { id: 2003, value: 3 },
            { id: 2005, value: 4 },
            { id: 2007, value: 5 },
            { id: 2009, value: 6 },
            { id: 2011, value: 7 },
            { id: 2013, value: 8 },
        ])
            .pipe(ezs('less', { than: 3 }))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(3, res.length);
                assert.equal(2000, res[0].id);
                assert.equal(2003, res[res.length - 1].id);
                done();
            });
    });

    it('less #2', (done) => {
        const res = [];
        from([
            { id: 2000, value: 1 },
            { id: 2001, value: 2 },
            { id: 2003, value: 3 },
            { id: 2005, value: 4 },
            { id: 2007, value: 5 },
            { id: 2009, value: 6 },
            { id: 2011, value: 7 },
            { id: 2013, value: 8 },
        ])
            .pipe(ezs('less', { than: 3, strict: true }))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(2, res.length);
                assert.equal(2000, res[0].id);
                assert.equal(2001, res[res.length - 1].id);
                done();
            });
    });


    it('less #3', (done) => {
        const res = [];
        from([
            { id: 2000, value: 1 },
            { id: 2001, value: 2 },
            { id: 2003, value: 3 },
            { id: 2005, value: 4 },
            { id: 2007, value: 5 },
            { id: 2009, value: 6 },
            { id: 2011, value: 7 },
            { id: 2013, value: 8 },
        ])
            .pipe(ezs('less', { than: 2005, strict: true, path: 'id' }))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(3, res.length);
                assert.equal(2000, res[0].id);
                assert.equal(2003, res[res.length - 1].id);
                done();
            });
    });

    it('drop #1', (done) => {
        const res = [];
        from([
            { id: 2000, value: 1 },
            { id: 2001, value: 2 },
            { id: 2003, value: 3 },
            { id: 2005, value: 4 },
            { id: 2007, value: 5 },
            { id: 2009, value: 3 },
            { id: 2011, value: 7 },
            { id: 2013, value: 8 },
        ])
            .pipe(ezs('drop', { if: 3 }))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(6, res.length);
                done();
            });
    });

    it('drop #2', (done) => {
        const res = [];
        from([
            { id: 2000, value: 1 },
            { id: 2001, value: 2 },
            { id: 2003, value: 3 },
            { id: 2005, value: 4 },
            { id: 2007, value: 5 },
            { id: 2003, value: 3 },
            { id: 2011, value: 7 },
            { id: 2013, value: 8 },
        ])
            .pipe(ezs('drop', { if: 2003, path: 'id' }))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(6, res.length);
                done();
            });
    });

    it('drop #3', (done) => {
        const res = [];
        from([
            { id: 2000, value: 1 },
            { id: 2001, value: 2 },
            { id: 2003, value: null },
            { id: 2005, value: '' },
            { id: 2007, value: 5 },
            { id: 2003, value: 3 },
            { id: 2011, value: undefined },
            { id: 2013, value: 8 },
        ])
            .pipe(ezs('drop'))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(5, res.length);
                done();
            });
    });

    it('drop #4', (done) => {
        const res = [];
        from([
            { id: 2000, value: 1 },
            { id: 2001, value: 2 },
            { id: 2003, value: 3 },
            { id: 2005, value: 4 },
            { id: 2007, value: 5 },
            { id: 2003, value: 6 },
            { id: 2011, value: 7 },
            { id: 2013, value: 8 },
        ])
            .pipe(ezs('drop', { if: [2, 3, 4] }))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(5, res.length);
                done();
            });
    });


    it('drop #5', (done) => {
        const res = [];
        from([
            { id: 2000, value: 1 },
            { id: 2001, value: 2 },
            { id: 2004, value: 3 },
            { id: 2005, value: 4 },
            { id: 2007, value: 5 },
            { id: 2003, value: 6 },
            { id: 2011, value: 7 },
            { id: 2013, value: 8 },
        ])
            .pipe(ezs('drop', { path: ['id', 'value'], if: [2, 3, 2007, 2003] }))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(4, res.length);
                done();
            });
    });

    it('drop #6', (done) => {
        const res = [];
        from([
            { id: 2000, value: 1 },
            { id: 2001, value: 2 },
            { id: 2003, value: 0 },
            { id: 2005, value: 4 },
            { id: 2007, value: 5 },
            { id: 2009, value: 0 },
            { id: 2011, value: 7 },
            { id: 2013, value: 8 },
        ])
            .pipe(ezs('drop', { if: 0 }))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(6, res.length);
                done();
            });
    });

    it('filter #1', (done) => {
        const res = [];
        from([
            { id: 2000, value: 1 },
            { id: 2001, value: 2 },
            { id: 2003, value: 3 },
            { id: 2005, value: 4 },
            { id: 2007, value: 5 },
            { id: 2009, value: 3 },
            { id: 2011, value: 7 },
            { id: 2013, value: 8 },
        ])
            .pipe(ezs('filter', { if: 3 }))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(2, res.length);
                assert.equal(2003, res[0].id);
                done();
            });
    });

    it('filter #2', (done) => {
        const res = [];
        from([
            { id: 2000, value: 1 },
            { id: 2001, value: 2 },
            { id: 2003, value: 3 },
            { id: 2005, value: 4 },
            { id: 2007, value: 5 },
            { id: 2003, value: 3 },
            { id: 2011, value: 7 },
            { id: 2013, value: 8 },
        ])
            .pipe(ezs('filter', { if: 2003, path: 'id' }))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(2, res.length);
                assert.equal(2003, res[0].id);
                done();
            });
    });

    it('filter #3', (done) => {
        const res = [];
        from([
            { id: 2000, value: 1 },
            { id: 2001, value: 2 },
            { id: 2003, value: null },
            { id: 2005, value: '' },
            { id: 2007, value: 5 },
            { id: 2003, value: 3 },
            { id: 2011, value: undefined },
            { id: 2013, value: 8 },
        ])
            .pipe(ezs('filter'))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(3, res.length);
                done();
            });
    });

    it('filter #4', (done) => {
        const res = [];
        from([
            { id: 2000, value: 1 },
            { id: 2001, value: 2 },
            { id: 2003, value: 3 },
            { id: 2005, value: 4 },
            { id: 2007, value: 5 },
            { id: 2003, value: 6 },
            { id: 2011, value: 7 },
            { id: 2013, value: 8 },
        ])
            .pipe(ezs('filter', { if: [2, 3, 4] }))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(3, res.length);
                done();
            });
    });

    it('filter #5', (done) => {
        const res = [];
        from([
            { id: 2000, value: 1 },
            { id: 2001, value: 2 },
            { id: 2004, value: 3 },
            { id: 2005, value: 4 },
            { id: 2007, value: 5 },
            { id: 2003, value: 6 },
            { id: 2011, value: 7 },
            { id: 2013, value: 8 },
        ])
            .pipe(ezs('filter', { path: ['id', 'value'], if: [2, 3, 2007, 2003] }))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(4, res.length);
                assert.equal(2001, res[0].id);
                assert.equal(2004, res[1].id);
                assert.equal(2007, res[2].id);
                assert.equal(2003, res[3].id);
                done();
            });
    });

    it('multiply #1', (done) => {
        const res = [];
        from([
            { a: 2000, b: 1 },
            { a: 2001, b: 2 },
            { a: 2013, b: 8 },
        ])
            .pipe(ezs('multiply', { path: 'toto.titi', value: ['X', 'Y', 'Z'] }))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(9, res.length);
                assert.equal(2000, res[0].a);
                assert.equal('X', res[0].toto.titi);
                assert.equal(2000, res[1].a);
                assert.equal('Y', res[1].toto.titi);
                assert.equal(2000, res[2].a);
                assert.equal('Z', res[2].toto.titi);
                assert.equal(2013, res[6].a);
                assert.equal('X', res[6].toto.titi);
                assert.equal(2013, res[7].a);
                assert.equal('Y', res[7].toto.titi);
                assert.equal(2013, res[8].a);
                assert.equal('Z', res[8].toto.titi);
                done();
            });
    });

    it('multiply #2', (done) => {
        const res = [];
        from([
            { a: 2000, b: 1 },
            { a: 2001, b: 2 },
            { a: 2013, b: 8 },
        ])
            .pipe(ezs('multiply', { path: 'toto.titi', value: 'X' }))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(3, res.length);
                assert.equal(2000, res[0].a);
                assert.equal('X', res[0].toto.titi);
                assert.equal(2013, res[2].a);
                assert.equal('X', res[2].toto.titi);
                done();
            });
    });

    it('multiply #3', (done) => {
        const res = [];
        from([
            { a: 2000, b: 1 },
            { a: 2001, b: 2 },
            { a: 2013, b: 8 },
        ])
            .pipe(ezs('multiply', { path: ['toto.titi', 'truc.bidule'], value: 'X' }))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(3, res.length);
                assert.equal(2000, res[0].a);
                assert.equal('X', res[0].toto.titi);
                assert.equal(2013, res[2].a);
                assert.equal('X', res[2].toto.titi);
                done();
            });
    });

    it('multiply #4', (done) => {
        const res = [];
        from([
            { a: 2000, b: 1 },
            { a: 2001, b: 2 },
            { a: 2013, b: 8 },
        ])
            .pipe(ezs('multiply', { path: 'toto.titi' }))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(3, res.length);
                assert.equal(2000, res[0].a);
                assert(!res[0].toto);
                assert.equal(2013, res[2].a);
                assert(!res[2].toto);
                done();
            });
    });

    it('multiply #5', (done) => {
        const res = [];
        from([
            { a: 2000, b: 1 },
            { a: 2001, b: 2 },
            { a: 2013, b: 8 },
        ])
            .pipe(ezs('multiply', { path: null }))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(3, res.length);
                assert.equal(2000, res[0].a);
                assert(!res[0].toto);
                assert.equal(2013, res[2].a);
                assert(!res[2].toto);
                done();
            });
    });
    it('aggregate #1', (done) => {
        const res = [];
        from([
            { a: 'x', b: 'z' },
            { a: 't', b: 'z' },
            { a: 't', b: 'z' },
            { a: 'x', b: 'z' },
            { a: 'x', b: 'z' },
        ])
            .pipe(ezs('aggregate', { id: 'a' }))
            .pipe(ezs('summing'))
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 2);
                assert.equal(res[0].value, 3);
                assert.equal(res[1].value, 2);
                done();
            });
    });
    it('aggregate #2', (done) => {
        const res = [];
        from([
            { a: ['x', 'x'], b: 'z' },
            { a: ['t', 't'], b: 'z' },
            { a: ['t', 't'], b: 'z' },
            { a: ['x', 'x'], b: 'z' },
            { a: ['x', 'x'], b: 'z' },
        ])
            .pipe(ezs('aggregate', { id: 'a' }))
            .pipe(ezs('summing'))
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 2);
                assert.equal(res[0].value, 3);
                assert.equal(res[1].value, 2);
                done();
            });
    });
    it('aggregate #3', (done) => {
        const res = [];
        from([
            { a: 'x', b: 3 },
            { a: 't', b: 2 },
            { a: 't', b: 3 },
            { a: 'x', b: 1 },
            { a: 'x', b: 4 },
        ])
            .pipe(ezs('aggregate', { id: ['a', 'x'], value: 'b' }))
            .pipe(ezs('summing'))
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 2);
                assert.equal(res[0].value, 8);
                assert.equal(res[1].value, 5);
                done();
            });
    });

    it('aggregate #4', (done) => {
        const res = [];
        from([
            { a: 'x', b: 3 },
            { a: 't', b: 2 },
            { a: 't', b: 3 },
            { a: 'x', b: 1 },
            { a: 'x', b: 4 },
        ])
            .pipe(ezs('aggregate', { id: 'unknow' }))
            .pipe(ezs('summing'))
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 0);
                done();
            });
    });



});
