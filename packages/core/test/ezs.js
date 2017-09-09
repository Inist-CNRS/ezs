const assert = require('assert');
const fs = require('fs');
const path = require('path');
const ezs = require('../lib');


ezs.use(require('./locals'));

const Read = require('stream').Readable;
const PassThrough = require('stream').PassThrough;


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

describe('Build a pipeline', () => {
    /* */
    it('with no transformation', (done) => {
        let res = 0;
        const ten = new Decade();
        ten
            .pipe(ezs((input, output) => {
                output.send(input);
            }))
            .on('data', (chunk) => {
                res += chunk;
            })
            .on('end', () => {
                assert.strictEqual(res, 45);
                done();
            });
    });

    it('with transformation', (done) => {
        let res = 0;
        const ten = new Decade();
        ten
            .pipe(ezs((input, output) => {
                output.send(input + 1);
            }))
            .on('data', (chunk) => {
                res += chunk;
            })
            .on('end', () => {
                assert.strictEqual(res, 55);
                done();
            });
    });

    it('with error(throw)', (done) => {
        const ten = new Decade();
        ten
            .pipe(ezs(() => {
                throw new Error('Bang!');
            }))
            .on('data', (chunk) => {
                assert.ok(chunk instanceof Error);
            })
            .on('end', () => {
                done();
            });
    });

    it('with error(send)', (done) => {
        const ten = new Decade();
        ten
            .pipe(ezs('boum'))
            .on('data', (chunk) => {
                assert.ok(chunk instanceof Error);
            })
            .on('end', () => {
                done();
            });
    });


    it('with definied transformation', (done) => {
        let res = 0;
        const ten = new Decade();
        ten
            .pipe(ezs('plus1'))
            .on('data', (chunk) => {
                res += chunk;
            })
            .on('end', () => {
                assert.strictEqual(res, 55);
                done();
            });
    });


    it('with explosion', (done) => {
        let res = 0;
        const ten = new Decade();
        ten
            .pipe(ezs((input, output) => {
                for (let i = 0; i < input; i += 1) {
                    output.write(i);
                }
                output.end();
            }))
            .on('data', (chunk) => {
                res += chunk;
            })
            .on('end', () => {
                assert.strictEqual(res, 120);
                done();
            });
    });

    it('with empty pipeline', (done) => {
        let res = 0;
        const ten = new Decade();
        ten
            .pipe(ezs((input, output) => {
                output.send(input);
            }))
            .pipe(ezs.pipeline())
            .on('data', (chunk) => {
                res += chunk;
            })
            .on('end', () => {
                assert.strictEqual(res, 45);
                done();
            });
    });
    it('with standard pipeline', (done) => {
        let res = 0;
        const ten = new Decade();
        ten
            .pipe(ezs((input, output) => {
                output.send(input);
            }))
            .pipe(ezs('increment', { step: 2 }))
            .pipe(ezs('decrement', { step: 2 }))
            .on('data', (chunk) => {
                res += chunk;
            })
            .on('end', () => {
                assert.strictEqual(res, 45);
                done();
            });
    });
    it('with object pipeline', (done) => {
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
        const ten = new Decade();
        ten
            .pipe(ezs((input, output) => {
                output.send(input);
            }))
            .pipe(ezs.pipeline(commands))
            .pipe(ezs((input, output) => {
                output.send(input);
            }))
            .on('data', (chunk) => {
                res += chunk;
            })
            .on('end', () => {
                assert.strictEqual(res, 45);
                done();
            });
    });
    it('with script pipeline', (done) => {
        let res = 0;
        const commands = `
            # My first ezs script
            title = FOR TEST
            description = increment & decrement to have the same value from input to output

            [increment]
            step = 2

            [decrement]
            step = 1
        `;

        const ten = new Decade();
        ten
            .pipe(ezs((input, output) => {
                output.send(input);
            }))
            .pipe(ezs.script(commands))
            .on('data', (chunk) => {
                res += chunk;
            })
            .on('end', () => {
                assert.strictEqual(res, 54);
                done();
            });
    });
    it('with advanced script pipeline', (done) => {
        let res = 0;
        const commands = `
            # My first ezs script
            title = FOR TEST
            description = increment & decrement to have the same value from input to output

            [increment]
            step = fix(2)

            [decrement]
            step = fix(1)
        `;
        const ten = new Decade();
        ten
            .pipe(ezs((input, output) => {
                output.send(input);
            }))
            .pipe(ezs.script(commands))
            .on('data', (chunk) => {
                res += chunk;
            })
            .on('end', () => {
                assert.strictEqual(res, 54);
                done();
            });
    });

    it('with advanced script pipeline', (done) => {
        let res = 0;
        const commands = `
            # My first ezs script
            title = FOR TEST
            description = increment & decrement to have the same value from input to output

            [increment]
            step = fix(1, 1, 2) -> max()

            [decrement]
            step = fix(1, 2, 3) -> min()
        `;
        const ten = new Decade();
        ten
            .pipe(ezs((input, output) => {
                output.send(input);
            }))
            .pipe(ezs.script(commands))
            .on('data', (chunk) => {
                res += chunk;
            })
            .on('end', () => {
                assert.strictEqual(res, 54);
                done();
            });
    });


    it('with attribute script pipeline', (done) => {
        let res = 0;
        const commands = `
            # My first ezs script
            title = FOR TEST
            description = set local or global

            [attribute]
            label = a
            value = fix('a')

            [attribute]
            label = b.c
            value = fix('b.c')
        `;
        const ten = new Decade();
        ten
            .pipe(ezs((input, output) => {
                output.send({ val: input });
            }))
            .pipe(ezs.script(commands))
            .on('data', (chunk) => {
                res = chunk;
            })
            .on('end', () => {
                assert.strictEqual(res.a, 'a');
                assert.strictEqual(res.b.c, 'b.c');
                done();
            });
    });

    it('with attribute(multi) script pipeline', (done) => {
        let res = 0;
        const commands = `
            # My first ezs script
            title = FOR TEST
            description = set local or global

            [attribute]
            label = a
            value = fix('a')
            label = b.c
            value = fix('b.c')
        `;
        const ten = new Decade();
        ten
            .pipe(ezs((input, output) => {
                output.send({ val: input });
            }))
            .pipe(ezs.script(commands))
            .on('data', (chunk) => {
                res = chunk;
            })
            .on('end', () => {
                assert.strictEqual(res.a, 'a');
                assert.strictEqual(res.b.c, 'b.c');
                done();
            });
    });

    it('with attribute script pipeline', (done) => {
        let res = 0;
        const commands = `
            # My first ezs script
            title = FOR TEST
            description = set local or global

            [attribute]
            label = a
            value = fix('a')

            [attribute]
            label = b
            value = fix('b')
        `;
        const ten = new Decade();
        ten
            .pipe(ezs((input, output) => {
                output.send({ val: input });
            }))
            .pipe(ezs.script(commands))
            .on('data', (chunk) => {
                res = chunk;
            })
            .on('end', () => {
                assert.strictEqual(res.a, 'a');
                assert.strictEqual(res.b, 'b');
                done();
            });
    });


    it('with attribute with computation script pipeline', (done) => {
        let res = 0;
        const commands = `
            # My first ezs script
            title = FOR TEST
            description = set local or global

            [attribute]
            label = a
            value = 3
            label = b
            value = 4

            [attribute]
            label = c
            value = compute('a * b')

        `;
        const ten = new Decade();
        ten
            .pipe(ezs((input, output) => {
                output.send({ val: input });
            }))
            .pipe(ezs.script(commands))
            .on('data', (chunk) => {
                res = chunk;
            })
            .on('end', () => {
                assert.strictEqual(res.a, 3);
                assert.strictEqual(res.b, 4);
                assert.strictEqual(res.c, 12);
                done();
            });
    });

    it('with attribute with quote script pipeline', (done) => {
        let res = 0;
        const commands = `
            # My first ezs script
            title = FOR TEST
            description = set local or global

            [attribute]
            label = a
            value = l'école!

        `;
        const ten = new Decade();
        ten
            .pipe(ezs((input, output) => {
                output.send({ val: input });
            }))
            .pipe(ezs.script(commands))
            .on('data', (chunk) => {
                res = chunk;
            })
            .on('end', () => {
                assert.strictEqual(res.a, 'l\'école!');
                done();
            });
    });

    it('with error in the pipeline', (done) => {
        const commands = `
            # My first ezs script
            title = FOR TEST
            description = set local or global

            [attribute]
            label = a
            value = b

            [boum]

        `;
        const ten = new Decade();
        ten
            .pipe(ezs((input, output) => {
                output.send({ val: input });
            }))
            .pipe(ezs.script(commands))
            .on('data', (chunk) => {
                assert.ok(chunk instanceof Error);
            })
            .on('end', () => {
                done();
            });
    });


    it('with use command in the pipeline', (done) => {
        const commands = `
            [use]
            plugin = test/locals

            [boum]

        `;
        const ten = new Decade();
        ten
            .pipe(ezs((input, output) => {
                output.send({ val: input });
            }))
            .pipe(ezs.script(commands))
            .on('data', (chunk) => {
                assert.ok(chunk instanceof Error);
            })
            .on('end', () => {
                done();
            });
    });

    it('with slow command in the pipeline', (done) => {
        const commands = `
            [use]
            plugin = test/locals

            [slow]

        `;
        let res = 0;
        const ten = new Decade();
        ten
            .pipe(ezs((input, output) => {
                output.send(input);
            }))
            .pipe(ezs.script(commands))
            .on('data', (chunk) => {
                res += Number(chunk);
            })
            .on('end', () => {
                assert.strictEqual(res, 90);
                done();
            });
    });


    it('with input break during the executionpipeline', (done) => {
        const commands = `
            [use]
            plugin = test/locals

            [slow]

        `;
        let res = 0;
        const pass = new PassThrough({ objectMode: true });
        const ten = new Decade();
        ten
            .pipe(ezs((input, output) => {
                output.send(input);
            }))
            .pipe(pass)
            .pipe(ezs.script(commands))
            .on('data', (chunk) => {
                if (chunk === 4) {
                    pass.write(null);
                } else if (chunk < 4) {
                    res += Number(chunk);
                }
            })
            .on('end', () => {
                assert.strictEqual(res, 12);
                done();
            });
        pass.resume();
    });


    it('with input file pipeline', (done) => {
        const commands = `
            [use]
            plugin = test/locals

        `;
        let res = 0;
        const file = fs.createReadStream(path.resolve(__dirname, './sample.txt'));
        file.resume();
        file.setEncoding('utf8');
        file
            .pipe(ezs((input, output) => {
                output.send(input);
            }))
            .pipe(ezs.script(commands))
            .on('data', (chunk) => {
                res += Number(chunk);
            })
            .on('end', () => {
                assert.strictEqual(res, 1);
                done();
            });
    });

    /*
     * Unable to detect un bad statement
     *

    it('with bad statement in the pipeline', (done) => {
        const commands = `
            [use]
            plugin = test/locals

             [bad]

        `;
        let res = 0;
        const ten = new Decade();
        ten
            .pipe(ezs((input, output) => {
                output.send(input);
            }))
            .pipe(ezs.script(commands))
            .on('data', (chunk) => {
                res += Number(chunk);
            })
            .on('end', () => {
                assert.strictEqual(res, 45);
                done();
            });
    });

    /* */
    it('with single statement in the  pipeline', (done) => {
        let res = 0;
        const ten = new Decade();
        ten
            .pipe(ezs((input, output) => {
                output.send(input);
            }))
            .pipe(ezs((input, output) => {
                output.send({ b: input });
            }))
            .pipe(ezs.single('substitute', {
                label: 'a',
                value: 10,
            }))
            .pipe(ezs(function useglobal(input, output) {
                if (this.isLast()) {
                    return output.send(input);
                }
                return output.send({ c: input.b * input.$globals.a });
            }))
            .on('data', (chunk) => {
                res += chunk.c;
            })
            .on('end', () => {
                assert.strictEqual(res, 450);
                done();
            });
    });

    it('with single statement in the pipeline', (done) => {
        let res = 0;
        const commands = [
            {
                name: 'substitute',
                args: {
                    label: 'a',
                    value: 10,
                },
            },
        ];
        const ten = new Decade();
        ten
            .pipe(ezs((input, output) => {
                output.send(input);
            }))
            .pipe(ezs((input, output) => {
                output.send({ b: input });
            }))
            .pipe(ezs.single(commands))
            .pipe(ezs(function useglobal(input, output) {
                if (this.isLast()) {
                    return output.send(input);
                }
                return output.send({ c: input.b * input.$globals.a });
            }))
            .on('data', (chunk) => {
                res += chunk.c;
            })
            .on('end', () => {
                assert.strictEqual(res, 450);
                done();
            });
    });

    it('with tag transformation', (done) => {
        let res = 0;
        const ten = new Decade();
        ten
            .pipe(ezs((input, output) => {
                output.send({ a: input });
            }))
            .pipe(ezs('tag', {
                name: 'isPair',
                test: parse => parse('compute("a % 2 == 0")'),
            }))
            .pipe(ezs.with('isPair', (input, output) => {
                if (input) {
                    output.send({ a: 0 });
                } else {
                    output.send(input);
                }
            }))
            .on('data', (chunk) => {
                if (chunk) {
                    res += chunk.a;
                }
            })
            .on('end', () => {
                assert.strictEqual(res, 25);
                done();
            });
    });
    it('convert to number to object', (done) => {
        let res = 0;
        const commands = `

            [substitute]
            label = a
            value = self()

        `;
        const ten = new Decade();
        ten
            .pipe(ezs.script(commands))
            .on('data', (chunk) => {
                if (chunk) {
                    res += chunk.a;
                }
            })
            .on('end', () => {
                assert.strictEqual(res, 45);
                done();
            });
    });

    it('convert to number to object and apply a computation', (done) => {
        let res = 0;
        const commands = `

            [substitute]
            label = a
            value = self()

            [substitute]
            label = a
            value = compute("a + 1")

        `;
        const ten = new Decade();
        ten
            .pipe(ezs.script(commands))
            .on('data', (chunk) => {
                if (chunk) {
                    res += chunk.a;
                }
            })
            .on('end', () => {
                assert.strictEqual(res, 54);
                done();
            });
    });

    /*
    it('convert to number to object and apply a computation just one time', (done) => {
        let res = 0;
        const commands = `

            [substitute]
            label = a
            value = self()

            [debug]

            [substitute?single]
            label = a
            value = compute("a + 1")

            [debug]

        `;
        const ten = new Decade();
        ten
            .pipe(ezs.script(commands))
            .on('data', (chunk) => {
                if (chunk) {
                    res += chunk.a;
                }
            })
            .on('end', () => {
                assert.strictEqual(res, 46);
                done();
            });
    });
    */
});
