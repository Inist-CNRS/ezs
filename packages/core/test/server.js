const assert = require('assert');
const from = require('from');
const ezs = require('../lib');
const { M_SINGLE, M_DISPATCH, M_NORMAL, M_CONDITIONAL } = ezs.constants;
const JSONezs = require('../lib/json').default;

ezs.use(require('./locals'));

ezs.config('stepper', {
    step: 4,
});

const Read = require('stream').Readable;

class Upto extends Read {
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
describe('through a server', () => {
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

    it('with simple pipeline', (done) => {
        let res = 0;
        const commands = [
            {
                name: 'increment',
                args: {
                    step: 2,
                },
            },
            {
                name: 'decrement',
                args: {
                    step: 2,
                },
            },
        ];
        const servers = [
            '127.0.0.1',
        ];
        const ten = new Upto(10);
        ten
            .pipe(ezs.dispatch(commands, servers))
            .on('data', (chunk) => {
                res += chunk;
            })
            .on('end', () => {
                assert.strictEqual(res, 45);
                done();
            });
    });

    it('with simple pipeline (N connections)', (done) => {
        let res = 0;
        const commands = [
            {
                name: 'increment',
                args: {
                    step: 2,
                },
            },
            {
                name: 'decrement',
                args: {
                    step: 2,
                },
            },
        ];
        const servers = [
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
            .pipe(ezs.dispatch(commands, servers))
            .on('data', (chunk) => {
                res += chunk;
            })
            .on('end', () => {
                assert.strictEqual(res, 45);
                done();
            });
    });


    it('with second pipeline with different parameter', (done) => {
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
        const servers = [
            '127.0.0.1',
        ];
        const ten = new Upto(10);
        ten
            .pipe(ezs.dispatch(commands, servers))
            .on('data', (chunk) => {
                res += chunk;
            })
            .on('end', () => {
                assert.strictEqual(res, 54);
                done();
            });
    });

    it('with pipeline contains UTF8 parameter', (done) => {
        let res = [];
        const commands = [
            {
                name: 'replace',
                args: {
                    path: 'id',
                    value: 'Les Châtiments',
                },
            },
        ];
        const servers = [
            '127.0.0.1',
        ];
        const ten = new Upto(10);
        ten
            .pipe(ezs.dispatch(commands, servers))
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



    it('with pipeline with global parameter', (done) => {
        let res = 0;
        const commands = [
            {
                name: 'stepper',
            },
        ];
        const servers = [
            '127.0.0.1',
        ];
        const ten = new Upto(10);
        ten
            .pipe(ezs.dispatch(commands, servers))
            .on('data', (chunk) => {
                res += chunk;
            })
            .on('end', () => {
                assert.strictEqual(res, 81);
                done();
            });
    });


    it('with buggy pipeline', (done) => {
        let res = 0;
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
        const servers = [
            '127.0.0.1',
        ];
        const ten = new Upto(10);
        ten
            .pipe(ezs.dispatch(commands, servers))
            .on('data', (chunk) => {
                res += chunk;
            })
            .on('end', () => {
                assert.strictEqual(res, 0);
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
        const servers = [
            '127.0.0.0',
        ];
        const ten = new Upto(10);
        let semaphore = true;
        ten
            .pipe(ezs.dispatch(commands, servers))
            .on('error', (error) => {
                assert(error instanceof Error);
                if (semaphore) {
                    semaphore = false;
                    done();
                }
            });
    });

    it('with unknowed command in the pipeline', (done) => {
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
        const servers = [
            '127.0.0.1',
        ];
        const ten = new Upto(10);
        let semaphore = true;
        ten
            .pipe(ezs.dispatch(commands, servers))
            .on('error', (error) => {
                assert(error instanceof Error);
                if (semaphore) {
                    semaphore = false;
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
        const servers = [
            '127.0.0.1:30001',
            '127.0.0.1:30002',
            '127.0.0.1:30003',
        ];
        let res = 0;
        const ten = new Upto(10);
        ten
            .pipe(ezs.dispatch(commands, servers))
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
        const servers = [
            '127.0.0.1:30001',
            '127.0.0.1:30002',
            '127.0.0.1:30003',
        ];
        let res = 0;
        const ten = new Upto(500001);
        ten
            .pipe(ezs('replace', { path: 'a', value: "2" }))
            .pipe(ezs.dispatch(commands, servers))
            .on('data', (chunk) => {
                res += chunk.a;
            })
            .on('end', () => {
                assert.strictEqual(res, 500000);
                done();
            });
    }).timeout(100000);

    it('with a lot of delayed commands in distributed pipeline', (done) => {
        const commands = `
            [use]
            plugin = test/locals

            [beat?${M_DISPATCH}]

        `;
        const servers = [
            '127.0.0.1:30001',
            '127.0.0.1:30002',
            '127.0.0.1:30003',
        ];
        let res = 0;
        const ten = new Upto(10001);
        ten
            .pipe(ezs.dispatch(ezs.parseString(commands), servers))
            .on('data', (chunk) => {
                res += chunk.beat;
            })
            .on('end', () => {
                assert.strictEqual(res, 10000);
                done();
            });
    }).timeout(50000);


    it('with a same commands', (done) => {
        const commands = `
            [use]
            plugin = test/locals

            [increment]
            step = 1

        `;
        const commandsOBJ1 = ezs.parseString(commands);
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
          const commands = `

            [replace]
            path = a
            value = 7

            [assign]
            path = b
            value = 6

            [assign]
            path = c
            value = fix(env.k)

            [env]
            path = l
            value = get('b')

            [assign]
            path = d
            value = fix(env.l)


            [transit]
        `;
        const servers = [
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
            .pipe(ezs.dispatch(ezs.parseString(commands), servers, env))
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


    /**/
});
