import assert from 'assert';
import from from 'from';
import { Readable } from 'stream';
import ezs from '../src';
import JSONezs from '../src/json';

const {
    M_DISPATCH,
} = ezs.constants;

ezs.use(require('./locals'));

ezs.addPath(__dirname);

ezs.config('stepper', {
    step: 4,
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
describe('dispatch through server(s)', () => {
    const server1 = ezs.createServer();
    const server2 = ezs.createServer(30001);
    const server3 = ezs.createServer(30002);
    const server4 = ezs.createServer(30003);

    after(() => {
        server1.close();
        server2.close();
        server3.close();
        server4.close();
    });

    describe('simple statements, one server', () => {
        const script = `
            [use]
            plugin = test/locals

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
        const server = '127.0.0.1';

        it('with object', (done) => {
            let res = 0;
            const ten = new Upto(10);
            ten
                .pipe(ezs('dispatch', { commands, server }))
                .pipe(ezs('debug'))
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
                .pipe(ezs('dispatch', {
                    server,
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
                .pipe(ezs('dispatch', {
                    server,
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
                .pipe(ezs('dispatch', {
                    server,
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
                .pipe(ezs('dispatch', {
                    server,
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

    it('simple statements, N servers', (done) => {
        let res = 0;
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
        const server = [
            '127.0.0.1',
            '127.0.0.1',
            '127.0.0.1',
            '127.0.0.1',
            '127.0.0.1',
            '127.0.0.1',
            '127.0.0.1',
            '127.0.0.1',
            '127.0.0.1',
            '127.0.0.1',
        ];
        const ten = new Upto(10);
        ten
            .pipe(ezs('dispatch', { commands, server }))
            .pipe(ezs.catch())
            .on('data', (chunk) => {
                res += chunk;
            })
            .on('end', () => {
                assert.strictEqual(res, 54);
                done();
            });
    });


    it('simple statements, one server but with different parameter', (done) => {
        let res = 0;
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
        const server = [
            '127.0.0.1',
        ];
        const ten = new Upto(10);
        ten
            .pipe(ezs('dispatch', { commands, server }))
            .on('data', (chunk) => {
                res += chunk;
            })
            .on('end', () => {
                assert.strictEqual(res, 54);
                done();
            });
    });

    it('with commands using args contains UTF8 parameter', (done) => {
        const res = [];
        const commands = [
            {
                name: 'replace',
                args: {
                    path: 'id',
                    value: 'Les Châtiments',
                },
            },
        ];
        const server = [
            '127.0.0.1',
        ];
        const ten = new Upto(10);
        ten
            .pipe(ezs('dispatch', { commands, server }))
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
        const commands = [
            {
                name: 'stepper',
            },
        ];
        const server = [
            '127.0.0.1',
        ];
        const ten = new Upto(10);
        ten
            .pipe(ezs('dispatch', { commands, server }))
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
        const server = [
            '127.0.0.1',
        ];
        const ten = new Upto(10);
        ten
            .pipe(ezs('dispatch', { commands, server }))
            .pipe(ezs.catch())
            .on('error', (error) => {
                assert.ok(error instanceof Error);
                done();
            });
    });
    it('with unknowed server', (done) => {
        const commands = [
            {
                name: 'increment',
                args: {
                    step: 2,
                },
            },
        ];
        const server = [
            '127.0.0.0',
        ];
        const ten = new Upto(10);
        let semaphore = true;
        ten
            .pipe(ezs('dispatch', { commands, server }))
            .pipe(ezs.catch())
            .on('error', (error) => {
                assert(error instanceof Error);
                if (semaphore) {
                    semaphore = false;
                    done();
                }
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
        const server = [
            '127.0.0.1',
        ];
        const ten = new Upto(10);
        let semaphore = true;
        ten
            .pipe(ezs('dispatch', { commands, server }))
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
                mode: M_DISPATCH,
                args: {
                    step: 3,
                },
            },
            {
                name: 'decrement',
                mode: M_DISPATCH,
                args: {
                    step: 2,
                },
            },
        ];
        const server = [
            '127.0.0.1:30001',
            '127.0.0.1:30002',
            '127.0.0.1:30003',
        ];
        let res = 0;
        const ten = new Upto(10);
        ten
            .pipe(ezs('dispatch', { server, commands }))
            .on('data', (chunk) => {
                res += chunk;
            })
            .on('end', () => {
                assert.strictEqual(res, 54);
                done();
            });
    });

    it('with a lot of commands in distributed pipeline', (done) => {
        const commands = [
            {
                name: 'replace',
                mode: M_DISPATCH,
                args: {
                    path: 'a',
                    value: 1,
                },
            },
        ];
        const server = [
            '127.0.0.1:30001',
            '127.0.0.1:30002',
            '127.0.0.1:30003',
        ];
        let res = 0;
        const ten = new Upto(500001);
        ten
            .pipe(ezs('replace', { path: 'a', value: '2' }))
            .pipe(ezs('dispatch', { server, commands })) // ~ 9 seconds
            .on('data', (chunk) => {
                res += chunk.a;
            })
            .on('end', () => {
                assert.strictEqual(res, 500000);
                done();
            });
    }).timeout(100000);

    it('with a lot of delayed commands in distributed pipeline', (done) => {
        const script = `
            [use]
            plugin = test/locals

            [beat?${M_DISPATCH}]

        `;
        const server = [
            '127.0.0.1:30001',
            '127.0.0.1:30002',
            '127.0.0.1:30003',
        ];
        let res = 0;
        const ten = new Upto(10001);
        ten
            .pipe(ezs('dispatch', { script, server }))
            .on('data', (chunk) => {
                res += chunk.beat;
            })
            .on('end', () => {
                assert.strictEqual(res, 10000);
                done();
            });
    }).timeout(50000);


    it('with a same commands', (done) => {
        const script = `
            [use]
            plugin = test/locals

            [increment]
            step = 1

        `;
        const commandsOBJ1 = ezs.parseString(script);
        const commandsSTR1 = JSONezs.stringify(commandsOBJ1);
        const commandsOBJ2 = JSONezs.parse(commandsSTR1);
        const commandsSTR2 = JSONezs.stringify(commandsOBJ2);
        //        assert.strictEqual(commandsOBJ1[0].args, commandsOBJ2[0].args);
        assert.strictEqual(commandsSTR1, commandsSTR2);
        done();
        /*
        let res = 0;
        const ten = new Upto(10);
        ten
            .pipe(ezs((input, output) => {
                output.send(input);
            }))
            .pipe(ezs.pipeline(cccommands))
            .on('data', (chunk) => {
                res += Number(chunk);
            })
            .on('end', () => {
                assert.strictEqual(res, 90);
                done();
            });
            */
    });


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
        const server = [
            '127.0.0.1',
        ];
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
            .pipe(ezs('dispatch', { script, server }, env))
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
        const server = [
            '127.0.0.1',
        ];
        const res = [];
        from([
            [1, 1, 1, 1],
            [2, 2, 2, 2],
            [3, 3, 3, 3],
            [4, 4, 4, 4],
            [5, 5, 5, 5],
        ])
            .pipe(ezs('dispatch', { script, server }))
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


    /**/
});
