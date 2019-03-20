import assert from 'assert';
import Dir from 'path';
import from from 'from';
import fs from 'fs';
import { Readable, PassThrough } from 'stream';
import ezs from '../src';
import Expression from '../src/expression';

ezs.use(require('./locals'));

ezs.config('stepper', {
    step: 3,
});

class Decade extends Readable {
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

    it('with debug transformation', (done) => {
        let res = 0;
        const ten = new Decade();
        ten
            .pipe(ezs((input, output) => {
                output.send(input);
            }))
            .pipe(ezs('debug', {
                text: 'Debug message ',
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
    it('with definied transformation', (done) => {
        let res = 0;
        const ten = new Decade();
        ten
            .pipe(ezs('ignoreMe', { object: null }))
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
        const ten = new Decade();
        ten
            .pipe(ezs((input, output) => {
                output.send(input);
            }))
            .pipe(ezs('delegate', { script: '' }))
            .pipe(ezs('transit'))
            .on('error', (error) => {
                assert(error instanceof Error);
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
    it('with standard pipeline with global options', (done) => {
        let res = 0;
        const ten = new Decade();
        ten
            .pipe(ezs((input, output) => {
                output.send(input);
            }))
            .pipe(ezs('stepper', { sign: '+' }))
            .pipe(ezs('stepper', { sign: '-' }))
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
            .pipe(ezs('delegate', { commands }))
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
            .pipe(ezs('delegate', { script: commands }))
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
            .pipe(ezs('delegate', { script: commands }))
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
            .pipe(ezs('delegate', { script: commands }))
            .on('data', (chunk) => {
                res += chunk;
            })
            .on('end', () => {
                assert.strictEqual(res, 54);
                done();
            });
    });
    it('with assign script pipeline', (done) => {
        let res = 0;
        const commands = `
            # My first ezs script
            title = FOR TEST
            description = set local or global

            [assign]
            path = a
            value = fix('a')

            [assign]
            path = b.c
            value = fix('b.c')
        `;
        const ten = new Decade();
        ten
            .pipe(ezs((input, output) => {
                output.send({ val: input });
            }))
            .pipe(ezs('delegate', { script: commands }))
            .on('data', (chunk) => {
                res = chunk;
            })
            .on('end', () => {
                assert.strictEqual(res.a, 'a');
                assert.strictEqual(res.b.c, 'b.c');
                done();
            });
    });
    it('with assign(multi) script pipeline', (done) => {
        let res = 0;
        const commands = `
            # My first ezs script
            title = FOR TEST
            description = set local or global

            [assign]
            path = a
            value = fix('a')
            path = b.c
            value = fix('b.c')
            path = b.d
            value = fix([0,1])
        `;
        const ten = new Decade();
        ten
            .pipe(ezs((input, output) => {
                output.send({ val: input });
            }))
            .pipe(ezs('delegate', { script: commands }))
            .on('data', (chunk) => {
                res = chunk;
            })
            .on('end', () => {
                assert.strictEqual(res.a, 'a');
                assert.strictEqual(res.b.c, 'b.c');
                assert.strictEqual(res.b.d[0], 0);
                done();
            });
    });
    it('with assign script pipeline', (done) => {
        let res = 0;
        const commands = `
            # My first ezs script
            title = FOR TEST
            description = set local or global

            [assign]
            path = a
            value = fix('a')

            [assign]
            path = b
            value = fix('b')
        `;
        const ten = new Decade();
        ten
            .pipe(ezs((input, output) => {
                output.send({ val: input });
            }))
            .pipe(ezs('delegate', { script: commands }))
            .on('data', (chunk) => {
                res = chunk;
            })
            .on('end', () => {
                assert.strictEqual(res.a, 'a');
                assert.strictEqual(res.b, 'b');
                done();
            });
    });
    it('with assign with computation script pipeline', (done) => {
        let res = 0;
        const commands = `
            # My first ezs script
            title = FOR TEST
            description = set local or global

            [assign]
            path = a
            value = 3
            path = b
            value = 4

            [assign]
            path = c
            value = compute('a * b')

        `;
        const ten = new Decade();
        ten
            .pipe(ezs((input, output) => {
                output.send({ val: input });
            }))
            .pipe(ezs('delegate', { script: commands }))
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
    it('with assign with quote script pipeline', (done) => {
        let res = 0;
        const commands = `
            # My first ezs script
            title = FOR TEST
            description = set local or global

            [assign]
            path = a
            value = l'école!

        `;
        const ten = new Decade();
        ten
            .pipe(ezs((input, output) => {
                output.send({ val: input });
            }))
            .pipe(ezs('delegate', { script: commands }))
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

            [assign]
            path = a
            value = b

            [boum]

        `;
        const ten = new Decade();
        ten
            .pipe(ezs((input, output) => {
                output.send({ val: input });
            }))
            .pipe(ezs('delegate', { script: commands }))
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
            .pipe(ezs('delegate', { script: commands }))
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
            .pipe(ezs('delegate', { script: commands }))
            .on('data', (chunk) => {
                res += Number(chunk);
            })
            .on('end', () => {
                assert.strictEqual(res, 90);
                done();
            });
    }).timeout(5000);
    it('with input break during the executionpipeline', (done) => {
        const commands = `
            [use]
            plugin = test/locals

            [transit]

        `;
        let res = 0;
        const pass = new PassThrough({ objectMode: true });
        const ten = new Decade();
        ten
            .pipe(ezs((input, output) => {
                output.send(input);
            }))
            .pipe(pass)
            .pipe(ezs('delegate', { script: commands }))
            .on('data', (chunk) => {
                if (chunk === 4) {
                    pass.end();
                } else if (chunk < 4) {
                    res += Number(chunk);
                }
            })
            .on('end', () => {
                assert.strictEqual(res, 6);
                done();
            });
        pass.resume();
    });
    it('with input break during the executionpipeline (async))', (done) => {
        const commands = `
            [use]
            plugin = test/locals

            [slow]
            time = 2

        `;
        let res = 0;
        const pass = new PassThrough({ objectMode: true });
        const ten = new Decade();
        ten
            .pipe(ezs((input, output) => {
                output.send(input);
            }))
            .pipe(pass)
            .pipe(ezs('delegate', { script: commands }))
            .on('data', (chunk) => {
                if (chunk === 4) {
                    pass.end();
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
        const file = fs.createReadStream(Dir.resolve(__dirname, './sample.txt'));
        file.resume();
        file.setEncoding('utf8');
        file
            .pipe(ezs((input, output) => {
                output.send(input);
            }))
            .pipe(ezs('delegate', { script: commands }))
            .on('data', (chunk) => {
                res += Number(chunk);
            })
            .on('end', () => {
                assert.strictEqual(res, 1);
                done();
            });
    });
    //
    // A false good idea, because, we can't know how many objects
    // would be sent to the next statement. So, in some case, the
    // feed should be closed before all data should be sent
    //
    // it('with bad statement in the pipeline', (done) => {
    //    const commands = `
    //        [use]
    //        plugin = test/locals
    //
    //        [bad]
    //
    //    `;
    //    const ten = new Decade();
    //    ten
    //        .pipe(ezs((input, output) => {
    //            output.send(input);
    //        }))
    //        .pipe(ezs.fromString(commands))
    //        .on('data', (chunk) => {
    //            assert.ok(chunk instanceof Error);
    //            done();
    //        });
    // });

    it('without single statement in the  pipeline', (done) => {
        let res = 0;
        const ten = new Decade();
        const expr1 = new Expression('self()');
        const expr2 = new Expression('compute("a * b")');
        ten
            .pipe(ezs('replace', {
                path: 'a',
                value: expr1,
            }))
            .pipe(ezs('assign', {
                path: 'b',
                value: 1000,
            }))
            .pipe(ezs('assign', {
                path: 'c',
                value: expr2,
            }))
            .on('data', (chunk) => {
                res += chunk.c;
            })
            .on('end', () => {
                assert.strictEqual(res, 45000);
                done();
            });
    });

    it('with single statement in the  pipeline', (done) => {
        let res = 0;
        const ten = new Decade();
        const expr = new Expression('compute("a * b")');
        ten
            .pipe(ezs('replace', {
                path: 'a',
                value: new Expression('self()'),
            }))
            .pipe(ezs('singleton', {
                statement: 'replace',
                path: 'b',
                value: 1000,
            }))
            .pipe(ezs('assign', {
                path: 'c',
                value: expr,
            }))
            .on('data', (chunk) => {
                res += chunk.c;
            })
            .on('end', () => {
                assert.strictEqual(res, 45000);
                done();
            });
    });

    it('with singleton in the pipeline (object)', (done) => {
        let res = 0;
        const expr1 = new Expression('self()');
        const expr2 = new Expression('compute("a * b")');
        const ten = new Decade();
        ten
            .pipe(ezs('replace', {
                path: 'a',
                value: expr1,
            }))
            .pipe(ezs('singleton', {
                statement: 'replace',
                path: 'b',
                value: 1000,
            }))
            .pipe(ezs('assign', {
                path: 'c',
                value: expr2,
            }))
            .on('data', (chunk) => {
                res += chunk.c;
            })
            .on('end', () => {
                assert.strictEqual(res, 45000);
                done();
            });
    });

    it('with singleton in the pipeline (do nothing)', (done) => {
        let res = 0;
        from([
            1,
            2,
        ])
            .pipe(ezs('singleton', {
                statement: 'replace',
                path: 'a',
                value: 1000,
            }))
            .on('data', (chunk) => {
                res += chunk;
            })
            .on('end', () => {
                assert.strictEqual(res, 3);
                done();
            });
    });


    it('with single statement in the script', (done) => {
        let res = 0;
        const commands = `

            [replace]
            path = a
            value = self()

            [replace?single]
            path = b
            value = fix(1000)

            [assign]
            path = c
            value = compute("a * b")
        `;
        const ten = new Decade();
        ten
            .pipe(ezs('delegate', { script: commands }))
            .on('data', (chunk) => {
                if (chunk) {
                    res += chunk.c;
                }
            })
            .on('end', () => {
                assert.strictEqual(res, 45000);
                done();
            });
    });

    it('convert to number to object', (done) => {
        let res = 0;
        const commands = `

            [replace]
            path = a
            value = self()

        `;
        const ten = new Decade();
        ten
            .pipe(ezs('delegate', { script: commands }))
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

            [replace]
            path = a
            value = self()

            [replace]
            path = a
            value = compute("a + 1")

        `;
        const ten = new Decade();
        ten
            .pipe(ezs('delegate', { script: commands }))
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

    it('convert to number to object and apply a computation (file)', (done) => {
        let res = 0;
        const file = Dir.resolve(__dirname, './sample.ezs');
        const ten = new Decade();
        ten
            .pipe(ezs('delegate', { file }))
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
    it('Catch meta from script', (done) => {
        const commands = `

            title = Le titre
            description = La description

            [replace]
            path = a
            value = self()

            [replace]
            path = a
            value = compute("a + 1")

        `;
        const meta = ezs.metaString(commands);
        assert.strictEqual(meta.title, 'Le titre');
        assert.strictEqual(meta.description, 'La description');
        done();
    });

    it('Catch meta from file', (done) => {
        const filename = Dir.resolve(__dirname, './sample.ezs');
        const meta = ezs.metaFile(filename);
        assert.strictEqual(meta.title, 'exemple 1');
        assert.strictEqual(meta.description, 'increment de a');
        done();
    });

    it('with shift statement in the pipeline', (done) => {
        const ten = new Decade();
        const expr = new Expression('self()');
        ten
            .pipe(ezs('replace', {
                path: 'a',
                value: expr,
            }))
            .pipe(ezs('shift'))
            // eslint-disable-next-line
            .on('error', console.error) // Error [ERR_STREAM_PUSH_AFTER_EOF]: stream.push() after EOF
            .on('data', (chunk) => {
                assert.strictEqual(chunk.a, 1);
            })
            .on('end', () => {
                done();
            });
    });

    it('with extract statement in the  pipeline #1', (done) => {
        let res = 0;
        const ten = new Decade();
        ten
            .pipe(ezs('replace', {
                path: 'a',
                value: new Expression('self()'),
            }))
            .pipe(ezs('extract', { path: 'a' }))
            .on('data', (chunk) => {
                res += chunk;
            })
            .on('end', () => {
                assert.strictEqual(res, 45);
                done();
            });
    });
    it('with extract statement in the  pipeline #2', (done) => {
        let res = 1;
        const ten = new Decade();
        ten
            .pipe(ezs('replace', {
                path: 'a',
                value: new Expression('self()'),
            }))
            .pipe(ezs('extract', { path: 'b' }))
            .on('data', (chunk) => {
                res += 1;
                assert.ok(chunk instanceof Error);
            })
            .on('end', () => {
                assert.strictEqual(res, 10);
                done();
            });
    });
    it('with extract statement in the  pipeline #3', (done) => {
        const ten = new Decade();
        ten
            .pipe(ezs('replace', {
                path: 'a',
                value: new Expression('self()'),
            }))
            .pipe(ezs('assign', {
                path: 'b',
                value: new Expression('get(\'a\')'),
            }))
            .pipe(ezs('extract', { path: ['b', 'a'] }))
            .on('data', (chunk) => {
                assert.strictEqual(chunk[0], chunk[1]);
            })
            .on('end', () => {
                done();
            });
    });
    it('with keep statement in the  pipeline #1', (done) => {
        const ten = new Decade();
        ten
            .pipe(ezs('replace', {
                path: 'a',
                value: new Expression('self()'),
            }))
            .pipe(ezs('assign', {
                path: 'b',
                value: new Expression('get(\'a\')'),
            }))
            .pipe(ezs('keep', { path: 'a' }))
            .on('data', (chunk) => {
                assert.notStrictEqual(chunk.a, undefined);
                assert.strictEqual(chunk.b, undefined);
            })
            .on('end', () => {
                done();
            });
    });
    it('with keep statement in the  pipeline #2', (done) => {
        const ten = new Decade();
        ten
            .pipe(ezs('replace', {
                path: 'a',
                value: new Expression('self()'),
            }))
            .pipe(ezs('assign', {
                path: 'b',
                value: new Expression('get(\'a\')'),
            }))
            .pipe(ezs('assign', {
                path: 'c',
                value: new Expression('get(\'a\')'),
            }))
            .pipe(ezs('keep', { path: ['a', 'c'] }))
            .on('data', (chunk) => {
                assert.notStrictEqual(chunk.a, undefined);
                assert.strictEqual(chunk.b, undefined);
                assert.notStrictEqual(chunk.c, undefined);
            })
            .on('end', () => {
                done();
            });
    });
    it('with replace multi value #0', (done) => {
        const ten = new Decade();
        ten
            .pipe(ezs('replace', {
                path: 'a',
                value: 1,
            }))
            .on('data', (chunk) => {
                assert.strictEqual(chunk.a, 1);
            })
            .on('end', () => {
                done();
            });
    });
    it('with replace multi value #1', (done) => {
        const ten = new Decade();
        ten
            .pipe(ezs('replace', {
                path: 'a',
                value: [1, 2],
            }))
            .on('data', (chunk) => {
                assert.strictEqual(chunk.a[0], 1);
                assert.strictEqual(chunk.a[1], 2);
            })
            .on('end', () => {
                done();
            });
    });
    it('with replace multi value #2', (done) => {
        const ten = new Decade();
        ten
            .pipe(ezs('replace', {
                path: ['a', 'b'],
                value: [1, 2],
            }))
            .on('data', (chunk) => {
                assert.strictEqual(chunk.a, 1);
                assert.strictEqual(chunk.b, 2);
            })
            .on('end', () => {
                done();
            });
    });
    it('with replace multi value #3', (done) => {
        const ten = new Decade();
        ten
            .pipe(ezs('replace', {
                path: ['a', 'b'],
                value: [1, [2, 2]],
            }))
            .on('data', (chunk) => {
                assert.strictEqual(chunk.a, 1);
                assert.strictEqual(chunk.b[0], 2);
                assert.strictEqual(chunk.b[1], 2);
            })
            .on('end', () => {
                done();
            });
    });
    it('with replace multi value #4', (done) => {
        const ten = new Decade();
        ten
            .pipe(ezs('replace', {
                path: ['a', 'b'],
                value: 1,
            }))
            .on('data', (chunk) => {
                assert.strictEqual(chunk.a, 1);
                assert.strictEqual(chunk.b, undefined);
                assert.strictEqual(chunk.b, undefined);
            })
            .on('end', () => {
                done();
            });
    });
    it('with assign multi value #0', (done) => {
        const ten = new Decade();
        ten
            .pipe(ezs((input, output) => {
                output.send({ c: input });
            }))
            .pipe(ezs('assign', {
                path: 'a',
                value: 1,
            }))
            .on('data', (chunk) => {
                assert.strictEqual(chunk.a, 1);
            })
            .on('end', () => {
                done();
            });
    });
    it('with assign multi value #0bis', (done) => {
        const ten = new Decade();
        ten
            .pipe(ezs((input, output) => {
                output.send({ c: input });
            }))
            .pipe(ezs('assign', {
                path: 'a',
                value: new Expression('fix(1)'),
            }))
            .on('data', (chunk) => {
                assert.strictEqual(chunk.a, 1);
            })
            .on('end', () => {
                done();
            });
    });
    it('with assign multi value #1', (done) => {
        const ten = new Decade();
        ten
            .pipe(ezs((input, output) => {
                output.send({ c: input });
            }))
            .pipe(ezs('assign', {
                path: 'a',
                value: [1, 2],
            }))
            .on('data', (chunk) => {
                assert.strictEqual(chunk.a[0], 1);
                assert.strictEqual(chunk.a[1], 2);
            })
            .on('end', () => {
                done();
            });
    });
    it('with assign multi value #2', (done) => {
        const ten = new Decade();
        ten
            .pipe(ezs((input, output) => {
                output.send({ c: input });
            }))
            .pipe(ezs('assign', {
                path: ['a', 'b'],
                value: [1, 2],
            }))
            .on('data', (chunk) => {
                assert.strictEqual(chunk.a, 1);
                assert.strictEqual(chunk.b, 2);
            })
            .on('end', () => {
                done();
            });
    });
    it('with assign multi value #3', (done) => {
        const ten = new Decade();
        ten
            .pipe(ezs((input, output) => {
                output.send({ c: input });
            }))
            .pipe(ezs('assign', {
                path: ['a', 'b'],
                value: [1, [2, 2]],
            }))
            .on('data', (chunk) => {
                assert.strictEqual(chunk.a, 1);
                assert.strictEqual(chunk.b[0], 2);
                assert.strictEqual(chunk.b[1], 2);
            })
            .on('end', () => {
                done();
            });
    });
    it('with assign multi value #4', (done) => {
        const ten = new Decade();
        ten
            .pipe(ezs((input, output) => {
                output.send({ c: input });
            }))
            .pipe(ezs('assign', {
                path: ['a', 'b'],
                value: 1,
            }))
            .on('data', (chunk) => {
                assert.strictEqual(chunk.a, 1);
                assert.strictEqual(chunk.b, undefined);
                assert.strictEqual(chunk.b, undefined);
            })
            .on('end', () => {
                done();
            });
    });

    it('with no transformation but with an accumulator', (done) => {
        let res = 0;
        const ten = new Decade();
        ten
            .pipe(ezs('accu'))
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
    it('with no transformation but with an accumulator in a script', (done) => {
        const commands = `
            [use]
            plugin = test/locals

            [accu]
        `;
        let res = 0;
        const ten = new Decade();
        ten
            .pipe(ezs((input, output) => {
                output.send({ val: input });
            }))
            .pipe(ezs('delegate', { script: commands }))
            .on('data', (chunk) => {
                res += chunk.val;
            })
            .on('end', () => {
                assert.strictEqual(res, 45);
                done();
            });
    });

    it('with env variable in the pipeline #1', (done) => {
        const env = {
            c: 1,
        };
        let res = 0;
        const ten = new Decade();
        ten
            .pipe(ezs('replace', {
                path: 'a',
                value: new Expression('self()'),
            }))
            .pipe(ezs('assign', {
                path: 'c',
                value: new Expression("env('c')"),
            }, env))
            .on('data', (chunk) => {
                res += chunk.c;
            })
            .on('end', () => {
                assert.strictEqual(res, 9);
                done();
            });
    });

    it('with env variable in the pipeline #2', (done) => {
        const env = {
            c: 1,
        };
        let res = 0;
        const ten = new Decade();
        ten
            .pipe(ezs('replace', {
                path: 'a',
                value: new Expression('self()'),
            }))
            .pipe(ezs('env', {
                path: 'c',
                value: new Expression('fix(2)'),
            }, env))
            .pipe(ezs('assign', {
                path: 'b',
                value: new Expression("env('c')"),
            }, env))
            .on('data', (chunk) => {
                res += chunk.b;
            })
            .on('end', () => {
                assert.strictEqual(res, 18);
                done();
            });
    });

    it('stuck/unstuck #1', (done) => {
        const env = {};
        const res = [];
        from([
            { a: 1, b: 5 },
            { a: 2, b: 5 },
            { a: 3, b: 5 },
            { a: 4, b: 5 },
            { a: 5, b: 5 },
        ])
            .pipe(ezs('env', { path: 'b', value: new Expression("get('b')") }, env))
            .pipe(ezs('replace', { path: 'toto', value: 'truc' }, env))
            .pipe(ezs('assign', { path: 'b', value: new Expression("env('b')") }, env))
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(5, res.length);
                assert.equal(5, res[0].b);
                assert.equal(5, res[1].b);
                assert.equal(5, res[2].b);
                done();
            });
    });


    it('stuck/unstuck #2', (done) => {
        const commands = `

            [env]
            path = b
            value = get('b')

            [replace]
            path = a
            value = z

            [assign]
            path = b
            value = env('b')
        `;
        const env = {};
        const res = [];
        from([
            { a: 1, b: 5 },
            { a: 2, b: 5 },
            { a: 3, b: 5 },
            { a: 4, b: 5 },
            { a: 5, b: 5 },
        ])
            .pipe(ezs('delegate', { script: commands }))
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(5, res.length);
                assert.equal(5, res[0].b);
                assert.equal(5, res[1].b);
                assert.equal(5, res[2].b);
                done();
            });
    });
    it('stuck/unstuck #3', (done) => {
        const commands = `
          [env]
          path = a 
          value = get('a')
          path = b
          value = get('b')

          [replace]
          path = a
          value = z
          path = b
          value = y

          [assign]
          path = a
          value = env('a')
          path = b
          value = env('b')
        `;
        const env = {};
        const res = [];
        from([
            { a: 1, b: 5 },
            { a: 1, b: 5 },
            { a: 1, b: 5 },
            { a: 1, b: 5 },
            { a: 1, b: 5 },
        ])
            .pipe(ezs('delegate', { script: commands }))
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(5, res.length);
                assert.equal(1, res[0].a);
                assert.equal(1, res[1].a);
                assert.equal(1, res[2].a);
                assert.equal(5, res[0].b);
                assert.equal(5, res[1].b);
                assert.equal(5, res[2].b);
                done();
            });
    });


/**/
});
