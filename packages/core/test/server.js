const assert = require('assert');
const ezs = require('../lib');
const JSONezs = require('../lib/json').default;

ezs.use(require('./locals'));

ezs.config('stepper', {
    step: 4,
});

const Read = require('stream').Readable;

class Decade extends Read {
    constructor() {
        super({ objectMode: true });
        this.i = 0;
    }
    _read() {
        this.i += 1;
        if (this.i >= 10) {
            this.push(null);
        } else {
            this.push(this.i);
        }
    }
}
describe('through a server', () => {
    const server = ezs.createServer();

    after(() => {
        server.close();
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
        const ten = new Decade();
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
        const ten = new Decade();
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
        const ten = new Decade();
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
        const ten = new Decade();
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
        const ten = new Decade();
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
        const ten = new Decade();
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
        const ten = new Decade();
        ten
            .pipe(ezs.dispatch(commands, servers))
            .on('error', (error) => {
                assert(error instanceof Error);
                done();
            });
    });

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
        const ten = new Decade();
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
