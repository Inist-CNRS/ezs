import assert from 'assert';
import from from 'from';
import { Readable } from 'stream';
import ezs from '../src/index.js';

ezs.use(require('./locals'));

ezs.addPath(__dirname);

ezs.settings.servePath = __dirname;

beforeAll(() => {
    ezs.settings.cacheEnable = true;
});
afterAll(() => {
    ezs.settings.cacheEnable = false;
});

class Upto extends Readable {
    constructor(m) {
        super({ objectMode: true });
        this.i = 0;
        this.m = m;
    }

    _read() {
        this.i += 1;
        if (this.i >= this.m) {
            this.push(null);
        } else {
            this.push(this.i);
        }
    }
}
describe('detach through file(s)', () => {
    describe('simple statements, one server', () => {
        it('with script', (done) => {
            const script = `
            [use]
            plugin = packages/core/test/locals

            [increment]
            step = 3

            [decrement]
            step = 2
        `;
            let res = 0;
            const ten = new Upto(10);
            ten
                .pipe(ezs('detach', {
                    script,
                }, { toto: 1, titi: 'truc' }))
                .on('data', (chunk) => {
                    res += chunk;
                })
                .on('end', () => {
                    assert.strictEqual(res, 54);
                    done();
                });
        });

        it('with file', (done) => {
            let res = 0;
            const ten = new Upto(10);
            ten
                .pipe(ezs('detach', {
                    file: './script.ini',
                }))
                .on('data', (chunk) => {
                    res += chunk;
                })
                .on('end', () => {
                    assert.strictEqual(res, 54);
                    done();
                });
        });
    });

    describe('standard statements', () => {
        it('with commands using args contains UTF8 parameter', (done) => {
            const res = [];
            const script = `
            [use]
            plugin = packages/core/test/locals

            [replace]
            path = id
            value = Les Châtiments
        `;
            const ten = new Upto(10);
            ten
                .pipe(ezs('detach', { script }))
                .on('data', (chunk) => {
                    res.push(chunk);
                })
                .on('end', () => {
                    assert.strictEqual(res[0].id, 'Les Châtiments');
                    assert.strictEqual(res[1].id, 'Les Châtiments');
                    assert.strictEqual(res[2].id, 'Les Châtiments');
                    done();
                });
        });

        it('with commands using global parameter', (done) => {
            let res = 0;
            const script = `
            [use]
            plugin = packages/core/test/locals

            [stepper]
            step = 4
        `;
            const ten = new Upto(10);
            ten
                .pipe(ezs('detach', { script }))
                .on('data', (chunk) => {
                    res += chunk;
                })
                .on('end', () => {
                    assert.strictEqual(res, 81);
                    done();
                });
        });
    });

    describe('error statements', () => {
        it('with buggy statements #2', (done) => {
            const script = `
            [use]
            plugin = packages/core/test/locals

            [increment]
            step = 2

            [boum]
            step = 2
        `;
            const ten = new Upto(10);
            ezs.settings.feed.timeout = (3 * 1000);
            ten
                .pipe(ezs('detach', { script }))
                .pipe(ezs.catch())
                .once('error', (error) => {
                    assert.ok(error instanceof Error);
                    done();
                });
        });

        it('with an unknowed statement', (done) => {
            const script = `
            [use]
            plugin = packages/core/test/locals

            [increment]
            step = 2

            [turlututu]
            step = 2
        `;
            const ten = new Upto(10);
            ezs.settings.feed.timeout = (3 * 1000);
            ten
                .pipe(ezs('detach', { script }))
                .pipe(ezs.catch())
                .once('error', (error) => {
                    assert(error instanceof Error);
                    ten.destroy();
                    done();
                });
        });
        it('with buggy statement #1', (done) => {
            const script = `
            [use]
            plugin = packages/core/test/locals


            [plouf]
        `;
            from([
                { a: 1, b: 9 },
                { a: 2, b: 9 },
                { a: 1, b: 9 },
                { a: 1, b: 9 },
                { a: 1, b: 9 },
            ])
                .pipe(ezs('detach', {
                    script,
                }))
                .pipe(ezs.catch())
                .on('error', (error) => {
                    assert.ok(error instanceof Error);
                    done();
                });
        });

        it.skip('with endless statement', (done) => {
            // TODO: node_modules/readable-stream/lib/_stream_readable.js:1094 emit end at the nextTick while the worker has not yet closed the stream
            ezs.settings.feed.timeout = (3 * 1000);
            const script = `
            [use]
            plugin = packages/core/test/locals
            [debug]
            [noclose]
        `;
            from([
                { a: 1, b: 9 },
                { a: 2, b: 9 },
                { a: 1, b: 9 },
                { a: 1, b: 9 },
                { a: 1, b: 9 },
            ])
                .pipe(ezs('detach', {
                    script,
                }))
                .pipe(ezs.catch())
                .on('error', (e) => {
                    try {
                        expect(e.message).toEqual(expect.stringContaining('The pipe has not received any data'));
                        done();
                    } catch(ee) {
                        done(ee);
                    }
                })
                .on('end', () => done(new Error('This is not the expected behavior.')));
        }, 30000);


    });
    describe('advanced  statements', () => {
        it('with a lot of data', (done) => {
            const script = `
            [use]
            plugin = packages/core/test/locals

            [replace]
            path = a
            value = 1
        `;
            let res = 0;
            const ten = new Upto(50001);
            ten
                .pipe(ezs('replace', { path: 'a', value: '2' }))
                .pipe(ezs('detach', { script })) // ~ 9 seconds
                .on('data', (chunk) => {
                    res += chunk.a;
                })
                .on('end', () => {
                    assert.strictEqual(res, 50000);
                    done();
                });
        }, 1000000);

        it('with stuck/unstuck simple pipeline', (done) => {
            const script = `
            [use]
            plugin = packages/core/test/locals

            [replace]
            path = a
            value = 7

            [assign]
            path = b
            value = 6

            [assign]
            path = c
            value = env('k')

            [env]
            path = l
            value = get('b')

            [assign]
            path = d
            value = env('l')


            [transit]
        `;
            const env = {
                k: 5,
            };
            const res = [];
            from([
                { a: 1, b: 9 },
                { a: 2, b: 9 },
                { a: 3, b: 9 },
                { a: 4, b: 9 },
                { a: 5, b: 9 },
            ])
                .pipe(ezs('detach', { script }, env))
                .on('data', (chunk) => {
                    assert(typeof chunk === 'object');
                    res.push(chunk);
                })
                .on('end', () => {
                    assert.equal(5, res.length);
                    assert.equal(7, res[0].a);
                    assert.equal(6, res[0].b);
                    assert.equal(5, res[0].c);
                    assert.equal(7, res[1].a);
                    assert.equal(6, res[1].b);
                    assert.equal(5, res[1].c);
                    assert.equal(7, res[2].a);
                    assert.equal(6, res[2].b);
                    assert.equal(5, res[2].c);
                    done();
                });
        });

        it('an array of array in a pipeline', (done) => {
            const script = `
            [transit]
        `;
            const res = [];
            from([
                [1, 1, 1, 1],
                [2, 2, 2, 2],
                [3, 3, 3, 3],
                [4, 4, 4, 4],
                [5, 5, 5, 5],
            ])
                .pipe(ezs('detach', { script }))
                .on('data', (chunk) => {
                    assert(Array.isArray(chunk));
                    res.push(chunk);
                })
                .on('end', () => {
                    assert.equal(5, res.length);
                    assert.equal(4, res[0].length);
                    assert.equal(4, res[1].length);
                    assert.equal(4, res[2].length);
                    assert.equal(4, res[3].length);
                    assert.equal(4, res[4].length);
                    assert.equal(1, res[0][0]);
                    assert.equal(1, res[0][1]);
                    assert.equal(1, res[0][2]);
                    assert.equal(1, res[0][3]);
                    assert.equal(2, res[1][0]);
                    assert.equal(2, res[1][1]);
                    assert.equal(2, res[1][2]);
                    assert.equal(2, res[1][3]);
                    assert.equal(5, res[4][0]);
                    assert.equal(5, res[4][1]);
                    assert.equal(5, res[4][2]);
                    assert.equal(5, res[4][3]);
                    done();
                });
        });
        it('with self reference in the shell', (done) => {
            const script = `

            [replace]
            path = a
            value = get('a')
            path = b
            value = get('b').map((item) => _.get(self, 'b.0').concat(':').concat(item))

        `;
            const res = [];
            from([
                { a: 1, b: ['a', 'b'] },
                { a: 2, b: ['c', 'd'] },
                { a: 3, b: ['e', 'f'] },
                { a: 4, b: ['g', 'h'] },
                { a: 5, b: ['i', 'j'] },
            ])
                .pipe(ezs('detach', { script }))
                .on('data', (chunk) => {
                    assert(typeof chunk === 'object');
                    res.push(chunk);
                })
                .on('end', () => {
                    assert.equal(res.length, 5);
                    assert.equal(res[0].a, 1);
                    assert.equal(res[0].b[0], 'a:a');
                    assert.equal(res[0].b[1], 'a:b');
                    assert.equal(res[4].a, 5);
                    assert.equal(res[4].b[0], 'i:i');
                    assert.equal(res[4].b[1], 'i:j');

                    done();
                });
        });

    });

    /**/
    describe('nested statements', () => {

        it('baseline', (done) => {
            const script = `
            [use]
            plugin = packages/core/test/locals

            [increment]
            step = 1

            [decrement]
            step = 1
        `;
            let res = 0;
            const ten = new Upto(10);
            ten
                .pipe(ezs('detach', { script }))
                .on('data', (chunk) => {
                    res += chunk;
                })
                .on('end', () => {
                    assert.strictEqual(res, 45);
                    done();
                });
        });

        it('same result with delegated commands #1', (done) => {
            const script = `
            [use]
            plugin = packages/core/test/locals


            [increment]
            step = 1

            [detach]
            file = ./script.ini


            [decrement]
            step = 2


        `;
            let res = 0;
            const ten = new Upto(10);
            ten
                .pipe(ezs('delegate', { script }))
                .on('data', (chunk) => {
                    res += chunk;
                })
                .on('end', () => {
                    assert.strictEqual(res, 45);
                    done();
                });
        });
        it('same result with delegated commands #2', (done) => {
            const script = `
            [use]
            plugin = packages/core/test/locals


            [increment]
            step = 1

            [detach]

            [detach/use]
            plugin = packages/core/test/locals

            [detach/increment]
            step = 3

            [detach/decrement]
            step = 2

            [decrement]
            step = 2
        `;
            let res = 0;
            const ten = new Upto(10);
            ten
                .pipe(ezs('delegate', { script }))
                .on('data', (chunk) => {
                    res += chunk;
                })
                .on('end', () => {
                    assert.strictEqual(res, 45);
                    done();
                });
        });

        it('same result with 2 delegated commands', (done) => {
            const script = `
            [use]
            plugin = packages/core/test/locals

            [increment]
            step = 1

            [detach]
            file = ./script.ini

            [decrement]
            step = 2

            [increment]
            step = 1

            [detach]
            file = ./script.ini

            [decrement]
            step = 2
        `;
            let res = 0;
            const ten = new Upto(10);
            ten
                .pipe(ezs('delegate', { script }))
                .on('data', (chunk) => {
                    res += chunk;
                })
                .on('end', () => {
                    assert.strictEqual(res, 45);
                    done();
                });
        });

        it('same result with netsed delegated commands', (done) => {
            const script = `
            [use]
            plugin = packages/core/test/locals

            [increment]
            step = 1

            [detach]
            file = ./script.ini

            [decrement]
            step = 2
        `;
            let res = 0;
            const ten = new Upto(10);
            ten
                .pipe(ezs('detach', { script }))
                .on('data', (chunk) => {
                    res += chunk;
                })
                .on('end', () => {
                    assert.strictEqual(res, 45);
                    done();
                });
        });



        it('same result with deep nested commands', (done) => {
            const script = `
            [use]
            plugin = packages/core/test/locals

            [increment]
            step = 1

            [detach]

            [detach/use]
            plugin = packages/core/test/locals

            [detach/detach]

            [detach/detach/use]
            plugin = packages/core/test/locals

            [detach/detach/increment]
            step = 1

            [detach/increment]
            step = 1

            [detach]

            [detach/use]
            plugin = packages/core/test/locals

            [detach/detach]
            [detach/detach/detach]
            [detach/detach/detach/use]
            plugin = packages/core/test/locals

            [detach/detach/detach/decrement]
            step = 1

            [detach/decrement]
            step = 1

            [decrement]
            step = 1
        `;
            let res = 0;
            const ten = new Upto(10);
            ten
                .pipe(ezs('detach', { script }))
                .on('data', (chunk) => {
                    res += chunk;
                })
                .on('end', () => {
                    assert.strictEqual(res, 45);
                    done();
                });
        });


        it('other result with complex nested commands', (done) => {
            const script = `
            [use]
            plugin = packages/core/test/locals

            [increment]
            step = 1

            [detach]

            [detach/use]
            plugin = packages/core/test/locals
            [detach/increment]
            step = 2

            [detach/increment]
            step = 2

            [transit]

            [detach]
            [detach/use]
            plugin = packages/core/test/locals

            [detach/decrement]
            step = 1

            [decrement]
            step = 1
        `;
            let res = 0;
            const ten = new Upto(10);
            ten
                .pipe(ezs('detach', { script }))
                .on('data', (chunk) => {
                    res += chunk;
                })
                .on('end', () => {
                    assert.strictEqual(res, 72);
                    done();
                });
        });
    });

});
