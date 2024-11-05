const assert = require('assert');
const from = require('from');
const { PassThrough } = require('stream');
const ezs = require('../../core/src');

ezs.use(require('../src'));

describe('test', () => {
    it('CSVObject #1', (done) => {
        const res = [];
        from([
            ['a', 'b', 'c'],
            [1, 2, 3],
            [4, 5, 6],
        ])
            .pipe(ezs('CSVObject'))
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(2, res.length);
                assert.equal(2, res[0].b);
                done();
            });
    });

    it('CSVParse #1', (done) => {
        const res = [];
        from(['a,b,c\n', 'd,e,d\n'])
            .pipe(ezs('CSVParse'))
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(2, res.length);
                done();
            });
    });
    it('CSVParse #2', (done) => {
        const res = [];
        from([
            'a,b,c\nd,',
            'e,f\ng,',
            Buffer.from([0xE2]),
            Buffer.from([0x82]),
            Buffer.from([0xAC]),
            Buffer.from(','),
            Buffer.from([0xC2]),
            Buffer.from([0xA2]),

        ])
            .pipe(ezs('CSVParse'))
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(res.length, 3);
                assert.equal(res[2][1], '€');
                assert.equal(res[2][2], '¢');
                done();
            });
    });

    it('CSVString#1', (done) => {
        const res = [];
        from([
            ['a', 'b', 'c'],
            [1, 2, 3],
            [4, 5, 6],
        ])
            .pipe(ezs('CSVObject'))
            .pipe(ezs('CSVString', { format: 'strict' }))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(3, res.length);
                assert.equal('"a";"b";"c"\r\n', res[0]);
                done();
            });
    });

    it('CSVString#1bis', (done) => {
        const res = [];
        from([
            ['a', 'b', 'c'],
            [1, 2, 3],
            [4, 5, 6],
        ])
            .pipe(ezs('CSVObject'))
            .pipe(ezs('CSVString', { separator: ',' }))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(3, res.length);
                assert.equal('a,b,c\r\n', res[0]);
                done();
            });
    });

    it('CSVString#2', (done) => {
        const res = [];
        from([
            ['a', 'b', 'c'],
            [1, 2, 3],
            [null, undefined, ''],
        ])
            .pipe(ezs('CSVObject'))
            .pipe(ezs('CSVString', { format: 'strict' }))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                console.log(res);
                assert.equal(3, res.length);
                assert.equal('"a";"b";"c"\r\n', res[0]);
                assert.equal('"1";"2";"3"\r\n', res[1]);
                assert.equal('"";"";""\r\n', res[2]);
                done();
            });
    });

    it('JSONString #0a', (done) => {
        let res = '';
        from([])
            .pipe(ezs('JSONString'))
            .on('data', (chunk) => {
                assert(typeof chunk === 'string');
                res += chunk;
            })
            .on('end', () => {
                assert.strictEqual(res, '');
                done();
            });
    });

    it('JSONString #1', (done) => {
        from([
            {
                a: 1,
            },
            {
                b: 2,
            },
        ])
            .pipe(ezs('JSONString'))
            .on('data', (chunk) => {
                assert(typeof chunk === 'string');
            })
            .on('end', () => {
                done();
            });
    });
    it('JSONString #2', (done) => {
        let res = '';
        from([
            {
                a: 1,
            },
            {
                b: 2,
            },
        ])
            .pipe(ezs('JSONString', { wrap: false, indent: false }))
            .on('data', (chunk) => {
                res += chunk;
            })
            .on('end', () => {
                assert.strictEqual(res, '{"a":1},{"b":2}');
                done();
            });
    });
    it('JSONString #3', (done) => {
        let res = '';
        from([
            {
                a: 1,
            },
            {
                b: 2,
            },
        ])
            .pipe(ezs('JSONString', { wrap: false, indent: true }))
            .on('data', (chunk) => {
                res += chunk;
            })
            .on('end', () => {
                assert.strictEqual(res, '{\n    "a": 1\n},\n{\n    "b": 2\n}');
                done();
            });
    });
    it('BUFObject #1', (done) => {
        let res = Buffer.alloc(0);
        from(['A', 'B', 'C'])
            .pipe(ezs('BUFObject'))
            .on('data', (chunk) => {
                assert(Buffer.isBuffer(chunk));
                const len = res.length + chunk.length;
                res = Buffer.concat([res, chunk], len);
            })
            .on('end', () => {
                assert.strictEqual(res.toString(), 'ABC');
                done();
            });
    });
    it('CSVObject #1', (done) => {
        from([
            ['A', 'B', 'C.C'],
            [1, 2, 3],
        ])
            .pipe(ezs('CSVObject'))
            .on('data', (chunk) => {
                assert(chunk.A);
                assert(chunk.B);
                assert(chunk.CC);
            })
            .on('end', () => {
                done();
            });
    });
    it('CSVObject #2', (done) => {
        const res = [];
        const cmd = `
        [CSVParse]
        [CSVObject]
        `;
        from(['a,b\nc,d\n'])
            .pipe(ezs('delegate', { script: cmd }))
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert(res[0].a);
                assert.equal('c', res[0].a);
                assert.equal(1, res.length);

                done();
            });
    });
    it('CSVObject #3', (done) => {
        const res = [];
        const cmd = `
        [CSVParse]
        separator = \t
        quote = \b
        [CSVObject]
        `;
        from(['a\tb\nc\td\n'])
            .pipe(ezs('delegate', { script: cmd }))
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert(res[0].a);
                assert.equal('c', res[0].a);
                assert.equal(1, res.length);
                done();
            });
    });
    it('CSVObject #5', (done) => {
        const res = [];
        const cmd = `
        [CSVParse]
        separator = \t
        quote = "
        [CSVObject]
        `;
        from(['"a"\t"b"\n"c"\t"d"\n'])
            .pipe(ezs('delegate', { script: cmd }))
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert(res[0].a);
                assert.equal('c', res[0].a);
                assert.equal(1, res.length);
                done();
            });
    });

    it('CSVObject #4', (done) => {
        const res = [];
        from(['a\tb\nc\td\n'])
            .pipe(ezs('CSVParse', { separator: '\t', quote: '\b' }))
            .pipe(ezs('CSVObject'))
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert(res[0].a);
                assert.equal('c', res[0].a);
                assert.equal(1, res.length);
                done();
            });
    });

    it('CSVObject #5 same column name', (done) => {
        let res = [];
        from([
            ['a', 'a', 'b', 'b', 'b'],
            [1, 2, 3, 4, 5],
        ])
            .pipe(ezs('CSVObject'))
            .on('data', (chunk) => {
                expect(typeof chunk).toBe('object');
                res = [...res, chunk];
            })
            .on('end', () => {
                expect(res).toStrictEqual([
                    {
                        a1: 1,
                        a2: 2,
                        b1: 3,
                        b2: 4,
                        b3: 5,
                    },
                ]);
                done();
            });
    });

    it('CSVObject #6 lacking column name', (done) => {
        let res = [];
        from([['a'], [1, 2]])
            .pipe(ezs('CSVObject'))
            .on('data', (chunk) => {
                expect(typeof chunk).toBe('object');
                res = [...res, chunk];
            })
            .on('end', () => {
                expect(res).toStrictEqual([
                    {
                        a: 1,
                        'Column #1': 2,
                    },
                ]);
                done();
            });
    });

    it('CSVObject #7 data not array', (done) => {
        let res = [];
        from([['a'], { z: 1 }])
            .pipe(ezs('CSVObject'))
            .on('data', (chunk) => {
                expect(typeof chunk).toBe('object');
                res = [...res, chunk];
            })
            .on('end', () => {
                expect(res).toStrictEqual([]);
                done();
            });
    });

    it('OBJStandardize #1', (done) => {
        from([
            {
                a: 1,
                b: 2,
            },
            {
                b: 2,
                c: 3,
            },
            {
                a: 1,
                c: 3,
            },
        ])
            .pipe(ezs('OBJStandardize'))
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                assert(chunk.a === 1 || chunk.a === '');
                assert(chunk.b === 2 || chunk.b === '');
                assert(chunk.c === 3 || chunk.c === '');
            })
            .on('end', () => {
                done();
            });
    });

    it('OBJStandardize #2', (done) => {
        from([
            {
                a: 1,
                b: 2,
            },
            {
                a: 1,
                b: 2,
            },
            {
                a: 1,
                b: 2,
            },
        ])
            .pipe(ezs('OBJStandardize'))
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                assert(chunk.a === 1);
                assert(chunk.b === 2);
            })
            .on('end', () => {
                done();
            });
    });
    it('OBJStandardize #3', (done) => {
        const output = [];
        from([
            {
                a: 1,
                b: 2,
            },
            {
                a: false,
                b: null,
            },
            {
                a: 0,
            },
        ])
            .pipe(ezs('OBJStandardize'))
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                assert(output[0].a === 1);
                assert(output[0].b === 2);
                assert(output[1].a === false);
                assert(output[1].b === '');
                assert(output[2].a === 0);
                assert(output[2].b === '');
                done();
            });
    });

    it('OBJStandardize #4', (done) => {
        from([])
            .pipe(ezs('OBJStandardize'))
            .on('data', () => {
                assert(false, 'In this case, no data should be given.');
            })
            .on('end', () => {
                assert(true);
                done();
            });
    });

    it('XMLParse#1', (done) => {
        const pass = new PassThrough();
        let cnt = 0;
        pass.pipe(ezs('XMLParse', { separator: '/a/b' }))
            .on('data', (chunk) => {
                assert(chunk.$t);
                cnt += 1;
            })
            .on('end', () => {
                assert.equal(cnt, 7);
                done();
            });
        pass.end(
            '<a><b>1</b><b>2</b><b>3</b><b>4</b><b>5</b><b>6</b><b>7</b></a>',
        );
    });
    it('XMLString#1', (done) => {
        const xml =
            '<a><b>1</b><b>2</b><b>3</b><b>4</b><b>5</b><b>6</b><b>7</b></a>';
        const pass = new PassThrough();
        const output = [];
        pass.pipe(ezs('XMLParse', { separator: '/a/b' }))
            .pipe(ezs('XMLString', { rootElement: 'a', contentElement: 'b' }))
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                assert.equal(xml, output.join(''));
                done();
            });
        pass.end(xml);
    });

    it('URLParse/URLString', (done) => {
        const input = [
            'https://sciencemetrix-category-18.data.istex.fr/ark:/67375/Q4W-LHKDRZNG-N',
            'https://www.google.com/search?q=truc&oq=truc&aqs=chrome..69i57j0j35i39l2j0l2.709j0j7&sourceid=chrome&ie=UTF-8',
        ];
        const output = [];
        from(input)
            .pipe(ezs('URLParse'))
            // .pipe(ezs('debug'))
            .pipe(ezs('URLString'))
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                assert.equal(output.length, 2);
                assert.equal(input[0], output[0]);
                assert.equal(input[1], output[1]);
                done();
            });
    });

    /*
    it('URLGet #1', (done) => {
        let c = 0;
        from([
            {
                a: 1,
                u: 'https://registry.npmjs.org/ezs',
            },
            {
                a: 2,
                u: 'https://registry.npmjs.org/ezs-basics',
            },
        ])
            .pipe(ezs('URLGet', {
                source: 'u',
                target: 'v',
            }))
            .on('data', (chunk) => {
                c += 1;
                if (c === 1) {
                    assert(chunk.v.name === 'ezs');
                }
                if (c === 2) {
                    assert(chunk.v.name === 'ezs-basics');
                }
            })
            .on('end', () => {
                done();
            });
    });
    */
});
