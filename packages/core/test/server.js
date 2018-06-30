const assert = require('assert');
const ezs = require('../lib');
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
        ten
            .pipe(ezs.dispatch(commands, servers))
            .on('error', (error) => {
                assert(error instanceof Error);
                done();
            })
            .on('end', () => {
                done();
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
        ten
            .pipe(ezs.dispatch(commands, servers))
            .on('error', (error) => {
                assert(error instanceof Error);
                done();
            });
    });
    it('with commands in distributed pipeline', (done) => {
        const commands = [
            {
                name: 'increment',
                mode: 'unordered', //distributed ou server
                args: {
                    step: 3,
                },
            },
            {
                name: 'decrement',
                mode: 'unordered', //distributed ou server
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
            .pipe(ezs('debug'))
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
                mode: 'unordered', //distributed ou server
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
        const ten = new Upto(100001);
        ten
            .pipe(ezs('replace', { path: 'a', value: "2" }))
            .pipe(ezs.dispatch(commands, servers))
            .on('data', (chunk) => {
                res += chunk.a;
            })
            .on('end', () => {
                assert.strictEqual(res, 100000);
                done();
            });
    }).timeout(5000);;


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

    /**/
});
