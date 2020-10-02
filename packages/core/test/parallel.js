import assert from 'assert';
import from from 'from';
import { Readable } from 'stream';
import ezs from '../src';

ezs.use(require('./locals'));

ezs.addPath(__dirname);

ezs.settings.servePath = __dirname;

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
describe('parallel through worker(s)', () => {
    describe('with many workers', () => {
        it('transit into workers', (done) => {
            const script = `
            [transit]
        `;
            let res = 0;
            from([
                1, 1, 1, 1,
            ])
                .pipe(ezs('parallel', { concurrency: 4, script }))
                .pipe(ezs.catch())
                .on('error', (e) => done(e))
                .on('data', (chunk) => {
                    res += chunk;
                })
                .on('end', () => {
                    assert.strictEqual(res, 4);
                    done();
                });
        });
    });

    describe('with one worker', () => {
        const script = `
            [use]
            plugin = packages/core/test/locals

            [increment]
            step = 3

            [decrement]
            step = 2
        `;
        const commands = [
            {
                name: 'increment',
                args: {
                    step: 3,
                },
            },
            {
                name: 'decrement',
                args: {
                    step: 2,
                },
            },
        ];
        it('with command', (done) => {
            let res = 0;
            const ten = new Upto(10);
            ten
                .pipe(ezs('parallel', {
                    concurrency: 1,
                    command: [
                        'increment?step=3',
                        'debug',
                        'decrement?step=2',
                    ],
                }))
                .on('data', (chunk) => {
                    res += chunk;
                })
                .on('end', () => {
                    assert.strictEqual(res, 54);
                    done();
                });
        });

        it('with object', (done) => {
            let res = 0;
            const ten = new Upto(10);
            ten
                .pipe(ezs('parallel', { concurrency: 1, commands }))
                .on('data', (chunk) => {
                    res += chunk;
                })
                .on('end', () => {
                    assert.strictEqual(res, 54);
                    done();
                });
        });

        it('with script', (done) => {
            let res = 0;
            const ten = new Upto(10);
            ten
                .pipe(ezs('parallel', {
                    concurrency: 1,
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
                .pipe(ezs('parallel', {
                    concurrency: 1,
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

        it('with script', (done) => {
            let res = 0;
            const ten = new Upto(10);
            ten
                .pipe(ezs('parallel', {
                    concurrency: 1,
                    script,
                }))
                .on('data', (chunk) => {
                    res += chunk;
                })
                .on('end', () => {
                    assert.strictEqual(res, 54);
                    done();
                });
        });

        it('with commands', (done) => {
            let res = 0;
            const ten = new Upto(10);
            ten
                .pipe(ezs('parallel', {
                    concurrency: 1,
                    commands,
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

    it('with commands using global parameter', (done) => {
        let res = 0;
        const commands = [
            {
                name: 'stepper',
                args: {
                    step: 4,
                },
            },
        ];
        const ten = new Upto(10);
        ten
            .pipe(ezs('parallel', { concurrency: 1, commands }))
            .on('data', (chunk) => {
                res += chunk;
            })
            .on('end', () => {
                assert.strictEqual(res, 81);
                done();
            });
    });

    it('with buggy statements', (done) => {
        const commands = [
            {
                name: 'increment',
                args: {
                    step: 2,
                },
            },
            {
                name: 'boum',
                args: {
                    step: 2,
                },
            },
        ];
        const ten = new Upto(10);
        ten
            .pipe(ezs('parallel', { concurrency: 1, commands }))
            .pipe(ezs.catch())
            .on('error', (error) => {
                assert.ok(error instanceof Error);
                done();
            });
    });
    it('with an unknowed statement', (done) => {
        const commands = [
            {
                name: 'increment',
                args: {
                    step: 2,
                },
            },
            {
                name: 'turlututu',
                args: {
                    step: 2,
                },
            },
        ];
        const ten = new Upto(10);
        let semaphore = true;
        ten
            .pipe(ezs('parallel', { concurrency: 1, commands }))
            .pipe(ezs.catch())
            .on('error', (error) => {
                assert(error instanceof Error);
                if (semaphore) {
                    semaphore = false;
                    ten.destroy();
                    done();
                }
            });
    });
    it('with commands in distributed pipeline', (done) => {
        const commands = [
            {
                name: 'increment',
                mode: 'detachable',
                args: {
                    step: 3,
                },
            },
            {
                name: 'decrement',
                mode: 'detachable',
                args: {
                    step: 2,
                },
            },
        ];
        let res = 0;
        const ten = new Upto(10);
        ten
            .pipe(ezs('parallel', { concurrency: 1, commands }))
            .on('data', (chunk) => {
                res += chunk;
            })
            .on('end', () => {
                assert.strictEqual(res, 54);
                done();
            });
    });
    it('with commands in distributed pipeline #Bis', (done) => {
        const commands = [
            {
                name: 'increment',
                mode: 'detachable',
                args: {
                    step: 3,
                },
            },
            {
                name: 'decrement',
                mode: 'detachable',
                args: {
                    step: 2,
                },
            },
        ];
        let res = 0;
        const ten = new Upto(10);
        ten
            .pipe(ezs('shift'))
            .pipe(ezs('parallel', { concurrency: 1, commands }))
            .on('data', (chunk) => {
                res += chunk;
            })
            .on('end', () => {
                assert.strictEqual(res, 2);
                done();
            });
    });

    it('with a lot of commands in distributed pipeline', (done) => {
        const commands = [
            {
                name: 'replace',
                mode: 'detachable',
                args: {
                    path: 'a',
                    value: 1,
                },
            },
        ];
        let res = 0;
        const ten = new Upto(50001);
        ten
            .pipe(ezs('replace', { path: 'a', value: 'à remplacer' }))
            .pipe(ezs('parallel', { concurrency: 1, commands })) // ~ 9 seconds
            .on('data', (chunk) => {
                res += chunk.a;
            })
            .on('end', () => {
                assert.strictEqual(res, 50000);
                done();
            });
    }, 200000);

    it('with a lot of delayed commands in distributed pipeline', (done) => {
        const script = `
            [use]
            plugin = packages/core/test/locals

            [beat?detachable]

        `;
        let res = 0;
        const ten = new Upto(10001);
        ten
            .pipe(ezs('parallel', { concurrency: 1, script }))
            .on('data', (chunk) => {
                res += chunk.beat;
            })
            .on('end', () => {
                assert.strictEqual(res, 10000);
                done();
            });
    }, 500000);

    it('with stuck/unstuck simple pipeline', (done) => {
        const script = `

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
            .pipe(ezs('parallel', { concurrency: 1, script }, env))
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
            .pipe(ezs('parallel', { concurrency: 1, script }))
            .on('data', (chunk) => {
                assert(Array.isArray(chunk));
                res.push(chunk);
            })
            .on('end', () => {
                const resSorted = res.sort((a, b) => a[0] - b[0]);
                assert.equal(5, resSorted.length);
                assert.equal(4, resSorted[0].length);
                assert.equal(4, resSorted[1].length);
                assert.equal(4, resSorted[2].length);
                assert.equal(4, resSorted[3].length);
                assert.equal(4, resSorted[4].length);
                assert.equal(1, resSorted[0][0]);
                assert.equal(1, resSorted[0][1]);
                assert.equal(1, resSorted[0][2]);
                assert.equal(1, resSorted[0][3]);
                assert.equal(2, resSorted[1][0]);
                assert.equal(2, resSorted[1][1]);
                assert.equal(2, resSorted[1][2]);
                assert.equal(2, resSorted[1][3]);
                assert.equal(5, resSorted[4][0]);
                assert.equal(5, resSorted[4][1]);
                assert.equal(5, resSorted[4][2]);
                assert.equal(5, resSorted[4][3]);
                done();
            });
    });

    it('with buggy statement', (done) => {
        const commands = [
            {
                name: 'plouf',
                args: {
                    step: 2,
                },
            },
        ];
        from([
            { a: 1, b: 9 },
            { a: 2, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
        ])
            .pipe(ezs('parallel', {
                concurrency: 1,
                commands,
            }))
            .pipe(ezs.catch())
            .on('error', (error) => {
                assert.ok(error instanceof Error);
                done();
            });
    });
    it('with wrong parameter', (done) => {
        const commands = [];
        from([
            { a: 1, b: 9 },
            { a: 2, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
        ])
            .pipe(ezs('parallel', {
                concurrency: 1,
                commands,
            }))
            .pipe(ezs.catch())
            .on('error', (error) => {
                assert.ok(error instanceof Error);
                done();
            });
    });
    /**/
});
