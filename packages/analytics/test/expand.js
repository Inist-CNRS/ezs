import fs from 'fs';
import from from 'from';
import { PassThrough } from 'stream';
import ezs from '../../core/src';
import statements from '../src';

ezs.addPath(__dirname);

ezs.use(require('./locals'));

test('with script (all values) #1', (done) => {
    ezs.use(statements);
    const input = [
        { a: 1, b: 'a' },
        { a: 2, b: 'b' },
        { a: 3, b: 'c' },
        { a: 4, b: 'd' },
        { a: 5, b: 'e' },
        { a: 6, b: 'f' },
    ];
    const output = [];
    const script = `
            [use]
            plugin = analytics

            [assign]
            path = value
            value = get('value').toUpper()
        `;
    from(input)
        .pipe(ezs('expand', { path: 'b', script }))
        .pipe(ezs.catch())
        .on('error', done)
        .on('data', (chunk) => {
            output.push(chunk);
        })
        .on('end', () => {
            expect(output.length).toEqual(6);
            expect(output[0].b).toEqual('A');
            expect(output[1].b).toEqual('B');
            expect(output[2].b).toEqual('C');
            expect(output[3].b).toEqual('D');
            expect(output[4].b).toEqual('E');
            expect(output[5].b).toEqual('F');
            done();
        });
});
test('with script (all values) #2', (done) => {
    ezs.use(statements);
    const input = [
        { a: 1, b: 'a' },
        { a: 2, b: 'b' },
        { a: 3, b: 'c' },
        { a: 4, b: 'd' },
        { a: 5, b: 'e' },
        { a: 6, b: 'f' },
    ];
    const output = [];
    const script = `
            [use]
            plugin = analytics

            [assign]
            path = value
            value = get('value').toUpper()
        `;
    from(input)
        .pipe(ezs('expand', { size: 5, path: 'b', script }))
        .pipe(ezs.catch())
        .on('error', done)
        .on('data', (chunk) => {
            output.push(chunk);
        })
        .on('end', () => {
            expect(output.length).toEqual(6);
            expect(output[0].b).toEqual('A');
            expect(output[1].b).toEqual('B');
            expect(output[2].b).toEqual('C');
            expect(output[3].b).toEqual('D');
            expect(output[4].b).toEqual('E');
            expect(output[5].b).toEqual('F');
            done();
        });
});
test('with script (all values) #2', (done) => {
    ezs.use(statements);
    const input = [
        { a: 1, b: 'a' },
        { a: 2, b: 'b' },
        { a: 3, b: 'c' },
        { a: 4, b: 'd' },
        { a: 5, b: 'e' },
        { a: 6, b: 'f' },
    ];
    const output = [];
    const script = `
            [use]
            plugin = analytics

            [assign]
            path = value
            value = get('value').toUpper()
        `;
    from(input)
        .pipe(ezs('expand', { size: 3, path: 'b', script }))
        .pipe(ezs.catch())
        .on('error', done)
        .on('data', (chunk) => {
            output.push(chunk);
        })
        .on('end', () => {
            expect(output.length).toEqual(6);
            expect(output[0].b).toEqual('A');
            expect(output[1].b).toEqual('B');
            expect(output[2].b).toEqual('C');
            expect(output[3].b).toEqual('D');
            expect(output[4].b).toEqual('E');
            expect(output[5].b).toEqual('F');
            done();
        });
});
test('with script (less values)', (done) => {
    ezs.use(statements);
    const input = [
        { a: 1, b: 'a' },
        { a: 2, b: 'b' },
        { a: 3, b: 'c' },
        { a: 4, b: 'd' },
        { a: 5, b: 'e' },
        { a: 6, b: 'f' },
    ];
    const output = [];
    const script = `
            [use]
            plugin = analytics

            [assign]
            path = value
            value = get('value').thru(n => (n%2 === 0 ? n : null))
        `;
    from(input)
        .pipe(ezs('expand', { path: 'a', script }))
        .pipe(ezs.catch())
        .on('error', done)
        .on('data', (chunk) => {
            output.push(chunk);
        })
        .on('end', () => {
            expect(output.length).toEqual(6);
            expect(output[0].a).toEqual(null);
            expect(output[1].a).toEqual(2);
            expect(output[2].a).toEqual(null);
            expect(output[3].a).toEqual(4);
            expect(output[4].a).toEqual(null);
            expect(output[5].a).toEqual(6);
            done();
        });
});
test('with file', (done) => {
    ezs.use(statements);
    const input = [
        { a: 1, b: 'a' },
        { a: 2, b: 'b' },
        { a: 3, b: 'c' },
        { a: 4, b: 'd' },
        { a: 5, b: 'e' },
        { a: 6, b: 'f' },
    ];
    const output = [];
    const file = './datasource02.ini';

    from(input)
        .pipe(ezs('expand', { path: 'b', file }))
        .pipe(ezs.catch())
        .on('error', done)
        .on('data', (chunk) => {
            output.push(chunk);
        })
        .on('end', () => {
            expect(output.length).toEqual(6);
            expect(output[0].b).toEqual('A');
            expect(output[1].b).toEqual('B');
            expect(output[2].b).toEqual('C');
            expect(output[3].b).toEqual('D');
            expect(output[4].b).toEqual('E');
            expect(output[5].b).toEqual('F');
            done();
        });
});
test('with error script', (done) => {
    ezs.use(statements);
    const input = [
        { a: 1, b: 'a' },
        { a: 2, b: 'b' },
        { a: 3, b: 'c' },
        { a: 4, b: 'd' },
        { a: 5, b: 'e' },
        { a: 6, b: 'f' },
    ];
    const script = `
            [use]
            plugin = analytics

            [exchange]
            value = forbidden
            [files]
            location = ${__dirname}
        `;
    const filename = `${__dirname}/forbidden`;
    fs.writeFileSync(filename, 'secret', 'utf8');
    fs.chmodSync(filename, 0o333, done);
    from(input)
        .pipe(ezs('expand', { path: 'b', script }))
        .pipe(ezs.catch())
        .on('error', (e) => {
            fs.unlinkSync(filename);
            expect(e.message).toEqual(expect.stringContaining('permission denied'));
            done();
        })
        .on('end', () => {
            fs.unlinkSync(filename);
            done(new Error('Error is the right behavior'));
        });
});
test('with no script', (done) => {
    ezs.use(statements);
    const input = [
        { a: 1, b: 'a' },
        { a: 2, b: 'b' },
        { a: 3, b: 'c' },
        { a: 4, b: 'd' },
        { a: 5, b: 'e' },
        { a: 6, b: 'f' },
    ];
    from(input)
        .pipe(ezs('expand', { path: 'b' }))
        .pipe(ezs.catch())
        .on('error', (e) => {
            expect(e.message).toEqual(expect.stringContaining('Invalid parmeter'));
            done();
        })
        .on('data', () => {
            done(new Error('Error is the right behavior'));
        })
        .on('end', () => {
            done(new Error('Error is the right behavior'));
        });
});

test('with no path', (done) => {
    ezs.use(statements);
    const input = [
        { a: 1, b: 'a' },
        { a: 2, b: 'b' },
        { a: 3, b: 'c' },
        { a: 4, b: 'd' },
        { a: 5, b: 'e' },
        { a: 6, b: 'f' },
    ];
    const output = [];
    const script = `
            [transit]
        `;
    from(input)
        .pipe(ezs('expand', { script }))
        .pipe(ezs.catch())
        .on('error', done)
        .on('data', (chunk) => {
            output.push(chunk);
        })
        .on('end', () => {
            expect(output.length).toEqual(6);
            expect(output[0].b).toEqual('a');
            expect(output[1].b).toEqual('b');
            expect(output[2].b).toEqual('c');
            expect(output[3].b).toEqual('d');
            expect(output[4].b).toEqual('e');
            expect(output[5].b).toEqual('f');
            done();
        });
});
test('with no value #1', (done) => {
    ezs.use(statements);
    const input = [
        { a: 1, b: [] },
        { a: 2, b: 'b' },
        { a: 3, b: false },
        { a: 4, b: 0 },
        { a: 5, b: null },
        { a: 6, b: undefined },
    ];
    const output = [];
    const script = `
            [use]
            plugin = analytics

            [assign]
            path = value
            value = get('value').toUpper()
        `;
    from(input)
        .pipe(ezs('expand', { path: 'b', script }))
        .pipe(ezs.catch())
        .on('error', done)
        .on('data', (chunk) => {
            output.push(chunk);
        })
        .on('end', () => {
            expect(output.length).toEqual(6);
            expect(output[0].b).toEqual([]);
            expect(output[1].b).toEqual('B');
            expect(output[2].b).toEqual(false);
            expect(output[3].b).toEqual(0);
            expect(output[4].b).toEqual(null);
            expect(output[5].b).toEqual(undefined);
            done();
        });
});
test('with bad path', (done) => {
    ezs.use(statements);
    const input = [
        { a: 1, b: 'a' },
        { a: 2, b: 'b' },
        { a: 3, b: 'c' },
        { a: 4, b: 'd' },
        { a: 5, b: 'e' },
        { a: 6, b: 'f' },
    ];
    const output = [];
    const script = `
            [transit]
        `;
    from(input)
        .pipe(ezs('expand', { path: 'c', script }))
        .pipe(ezs.catch())
        .on('error', done)
        .on('data', (chunk) => {
            output.push(chunk);
        })
        .on('end', () => {
            expect(output).toEqual(input);
            done();
        });
});
test('with bad path #2', (done) => {
    ezs.use(statements);
    const input = [
        { a: 1, b: 'a' },
        { a: 2, c: 'b' },
        { a: 3, b: 'c' },
        { a: 4, c: 'd' },
        { a: 5, b: 'e' },
        { a: 6, c: 'f' },
    ];
    const output = [];
    const script = `
            [transit]
        `;
    from(input)
        .pipe(ezs('expand', { path: 'b', script }))
        .pipe(ezs.catch())
        .on('error', done)
        .on('data', (chunk) => {
            output.push(chunk);
        })
        .on('end', () => {
            expect(output).toEqual(input);
            done();
        });
});
test('with a script that loses the identifier', (done) => {
    ezs.use(statements);
    const input = [
        { a: 1, b: 'a' },
        { a: 2, b: 'b' },
        { a: 3, b: 'c' },
        { a: 4, b: 'd' },
        { a: 5, b: 'e' },
        { a: 6, b: 'f' },
    ];
    const script = `
            [use]
            plugin = analytics

            [replace]
            path = value
            value = get('value').toUpper()
        `;

    from(input)
        .pipe(ezs('expand', { path: 'b', script }))
        .pipe(ezs.catch())
        .on('error', (e) => {
            expect(e.message).toEqual(expect.stringContaining('id was corrupted'));
            done();
        })
        .on('end', () => {
            done(new Error('Error is the right behavior'));
        });
});
test('with a script that break the identifier #1', (done) => {
    ezs.use(statements);
    const input = [
        { a: 1, b: 'a' },
        { a: 2, b: 'b' },
        { a: 3, b: 'c' },
        { a: 4, b: 'd' },
        { a: 5, b: 'e' },
        { a: 6, b: 'f' },
    ];
    const output = [];
    const script = `
            [use]
            plugin = analytics

            [assign]
            path = id.toto
            value = get('id')
        `;
    from(input)
        .pipe(ezs('expand', { path: 'b', script }))
        .pipe(ezs.catch())
        .on('data', (chunk) => {
            output.push(chunk);
        })
        .on('error', (e) => {
            expect(output.length).toEqual(0);
            expect(e.message).toEqual(expect.stringContaining('id was corrupted'));
            done();
        })
        .on('end', () => {
            done(new Error('Error is the right behavior'));
        });
});
test('with a script that break the identifier #2', (done) => {
    ezs.use(statements);
    const input = [
        { a: 1, b: 'a' },
        { a: 2, b: 'b' },
        { a: 3, b: 'c' },
        { a: 4, b: 'd' },
        { a: 5, b: 'e' },
        { a: 6, b: 'f' },
    ];
    const output = [];
    const script = `
            [use]
            plugin = analytics

            [replace]
            path = id
            value = get('id').replace(/2/, 'unknow')

            path = value
            value = get('value').toUpper()
        `;
    from(input)
        .pipe(ezs('expand', { path: 'b', script }))
        .pipe(ezs.catch())
        .on('data', (chunk) => {
            output.push(chunk);
        })
        .on('error', (e) => {
            expect(output.length).toEqual(1);
            expect(e.message).toEqual(expect.stringContaining('id was corrupted'));
            done();
        })
        .on('end', () => {
            done(new Error('Error is the right behavior'));
        });
});
test('with a buggy script', (done) => {
    ezs.use(statements);
    const input = [
        { a: 1, b: 'a' },
        { a: 2, b: 'b' },
        { a: 3, b: 'c' },
        { a: 4, b: 'd' },
        { a: 5, b: 'e' },
        { a: 6, b: 'f' },
    ];
    const output = [];
    const script = `
            [assign]
            path = value
            value = get(BADVAL).toUpper()
        `;

    from(input)
        .pipe(ezs('expand', { path: 'b', script }))
        .pipe(ezs.catch())
        .on('data', (chunk) => {
            output.push(chunk);
        })
        .on('error', (e) => {
            expect(e.message).toEqual(expect.stringContaining('BADVAL is not defined'));
            expect(output.length).toEqual(0);
            done();
        })
        .on('end', () => {
            done(new Error('Error is the right behavior'));
        });
});
test('with no script', (done) => {
    ezs.use(statements);
    const input = [
        { a: 1, b: 'a' },
        { a: 2, b: 'b' },
        { a: 3, b: 'c' },
        { a: 4, b: 'd' },
        { a: 5, b: 'e' },
        { a: 6, b: 'f' },
    ];
    const output = [];
    from(input)
        .pipe(ezs('expand', { path: 'b' }))
        .pipe(ezs.catch())
        .on('data', (chunk) => {
            output.push(chunk);
        })
        .on('error', (e) => {
            expect(e.message).toEqual(expect.stringContaining('Invalid parmeter for createCommands'));
            expect(output.length).toEqual(0);
            done();
        })
        .on('end', () => {
            done(new Error('Error is the right behavior'));
        });
});

const env = {
    executed: false,
};
const cacheName = Date.now();

test('with script (all values) with cache', (done) => {
    ezs.use(statements);
    const output1 = [];
    const output2 = [];
    const script = `
            [use]
            plugin = analytics

            [env]
            path = executed
            value = fix(true)

            [assign]
            path = value
            value = get('value').toUpper()

        `;
    from([
        { a: 1, b: 'a' },
        { a: 2, b: 'b' },
        { a: 3, b: 'c' },
        { a: 4, b: 'd' },
        { a: 5, b: 'e' },
        { a: 6, b: 'f' },
    ])
        .pipe(ezs('expand', { path: 'b', script, cacheName }, env))
        .pipe(ezs.catch())
        .on('error', done)
        .on('data', (chunk) => {
            output1.push(chunk);
        })
        .on('end', () => {
            expect(output1.length).toEqual(6);
            expect(output1[0].b).toEqual('A');
            expect(output1[1].b).toEqual('B');
            expect(output1[2].b).toEqual('C');
            expect(output1[3].b).toEqual('D');
            expect(output1[4].b).toEqual('E');
            expect(output1[5].b).toEqual('F');
            expect(env.executed).toEqual(true);
            env.executed = false;
            from([
                { a: 1, b: 'a' },
                { a: 2, b: 'b' },
                { a: 3, b: 'c' },
                { a: 4, b: 'd' },
                { a: 5, b: 'e' },
                { a: 6, b: 'f' },
            ])
                .pipe(ezs('expand', { path: 'b', script, cacheName }, env))
                .pipe(ezs.catch())
                .on('error', done)
                .on('data', (chunk) => {
                    output2.push(chunk);
                })
                .on('end', () => {
                    expect(output2.length).toEqual(6);
                    expect(output2[0].b).toEqual('A');
                    expect(output2[1].b).toEqual('B');
                    expect(output2[2].b).toEqual('C');
                    expect(output2[3].b).toEqual('D');
                    expect(output2[4].b).toEqual('E');
                    expect(output2[5].b).toEqual('F');
                    expect(env.executed).toEqual(false);
                    done();
                });
        });
});

test('with a script that loses some items', (done) => {
    ezs.use(statements);
    const output = [];
    const input = [
        { a: 1, b: 'a' },
        { a: 2, b: 'b' },
        { a: 3, b: 'c' },
        { a: 4, b: 'd' },
        { a: 5, b: 'e' },
        { a: 6, b: 'f' },
    ];
    const script = `
            [use]
            plugin = analytics

            [drop]
            if = c

            [assign]
            path = value
            value = get('value').toUpper()
        `;

    from(input)
        .pipe(ezs('expand', { path: 'b', script }))
        .pipe(ezs.catch())
        .on('error', done)
        .on('data', (chunk) => {
            output.push(chunk);
        })
        .on('end', () => {
            expect(output.length).toEqual(5);
            expect(output[0].b).toEqual('A');
            expect(output[1].b).toEqual('B');
            expect(output[2].b).toEqual('D');
            expect(output[3].b).toEqual('E');
            expect(output[4].b).toEqual('F');
            done();
        });
});
describe('with sub script and brute force write', () => {
    const size = 100;
    const input = [
        { a: 1, b: 'a' },
        { a: 2, b: 'b' },
        { a: 3, b: 'c' },
        { a: 4, b: 'd' },
        { a: 5, b: 'e' },
        { a: 6, b: 'f' },
        { a: 7, b: 'g' },
        { a: 8, b: 'h' },
        { a: 9, b: 'i' },
        { a: 10, b: 'j' },
    ];

    const func = (script) => new Promise((resolve, reject) => {
        const output = [];
        const strm = new PassThrough({ objectMode: true });
        try  {
            strm
                .pipe(ezs('delegate', { script }))
                .on('data', (chunk) => {
                    output.push(chunk);
                })
                .on('end', () => {
                    resolve(output);
                })
                .on('error', (e) => {
                    reject(e);
                });
            // brute force write ! (no back pressure control)
            for (const entry of input) {
                strm.write(entry);
            }
            strm.end();
        } catch(e) {
            reject(e);
        }
    });

    beforeAll(() => jest.setTimeout(60000));
    afterAll(() => jest.setTimeout(5000));

    test('no error', (done) => {
        ezs.use(statements);
        const script = `
            [use]
            plugin = basics
            plugin = analytics

            [replace]
            path = id
            value = get('a')
            path = value
            value = get('b')

            [validate]
            path = id
            rule = required

            path = value
            rule = required

            [expand]
            size = 100
            path = value

            [expand/assign]
            path = value
            value = get('value').toUpper()

            [replace]
            path = a
            value = get('id')
            path = b
            value = get('value')
        `;

        Promise.all(Array(size).fill(true).map(() => func(script)))
            .then((r) => {
                expect(r.length).toBe(size);
                expect(r[0].length).toBe(input.length);
                expect(r[0][0].b).toEqual('A');
                expect(r[0][1].b).toEqual('B');
                expect(r[0][2].b).toEqual('C');
                expect(r[0][3].b).toEqual('D');
                expect(r[0][4].b).toEqual('E');
                expect(r[0][5].b).toEqual('F');
                done();
            })
            .catch(done);
    });

    test('erratic fatal error in depth', (done) => {
        ezs.use(statements);
        const script = `
            [use]
            plugin = basics
            plugin = analytics

            [replace]
            path = id
            value = get('a')
            path = value
            value = get('b')

            [validate]
            path = id
            rule = required

            path = value
            rule = required

            [expand]
            size = 100
            path = value

            [expand/assign]
            path = value
            value = get('value').toUpper()

            [expand/erraticError]
            stop = true

            [replace]
            path = a
            value = get('id')
            path = b
            value = get('value')
        `;

        Promise.all(Array(size).fill(true).map(() => func(script)))
            .then(() => done(new Error('Error is the right behavior')))
            .catch((e) => {
                expect(e.message).toEqual(expect.stringContaining('Erratic Error'));
                done();
            });
    });


    test('erratic error in depth', (done) => {
        ezs.use(statements);
        const script = `
            [use]
            plugin = basics
            plugin = analytics

            [replace]
            path = id
            value = get('a')
            path = value
            value = get('b')

            [validate]
            path = id
            rule = required

            path = value
            rule = required

            [expand]
            size = 100
            path = value

            [expand/assign]
            path = value
            value = get('value').toUpper()

            [expand/erraticError]
            stop = false

            [replace]
            path = a
            value = get('id')
            path = b
            value = get('value')
        `;

        Promise.all(Array(size).fill(true).map(() => func(script)))
            .then((r) => {
                const e = r.map(x => x.filter(y => (y instanceof Error)).pop()).filter(Boolean).pop();
                expect(e.message).toEqual(expect.stringContaining('Erratic Error'));
                done();
            })
            .catch(done);
    });

    test('erratic error on top', (done) => {
        ezs.use(statements);
        const script = `
            [use]
            plugin = basics
            plugin = analytics

            [replace]
            path = id
            value = get('a')
            path = value
            value = get('b')

            [validate]
            path = id
            rule = required

            path = value
            rule = required

            [expand]
            size = 100
            path = value

            [expand/assign]
            path = value
            value = get('value').toUpper()

            [erraticError]
            stop = false

            [replace]
            path = a
            value = get('id')
            path = b
            value = get('value')
        `;

        Promise.all(Array(size).fill(true).map(() => func(script)))
            .then((r) => {
                expect(r.length).toBe(size);
                expect(r[0].length).toBe(input.length);

                const check = r
                    .reduce((cur, prev) => prev.concat(cur), [])
                    .some(x => (x instanceof Error));
                expect(check).toBeTruthy();
                done();
            })
            .catch(done);
    });

    test('truncated in depth', (done) => {
        ezs.use(statements);
        const script = `
            [use]
            plugin = basics
            plugin = analytics
            [replace]
            path = id
            value = get('a')
            path = value
            value = get('b')

            [validate]
            path = id
            rule = required

            path = value
            rule = required

            [expand]
            size = 100
            path = value

            [expand/assign]
            path = value
            value = get('value').toUpper()

            [expand/truncate]
            length = 3

            [replace]
            path = a
            value = get('id')
            path = b
            value = get('value')
        `;
        func(script)
            .then((r) => {
                expect(r[0].b).toEqual('A');
                expect(r[1].b).toEqual('B');
                expect(r[2].b).toEqual('C');
                expect(r[3].b).toEqual('d');
                expect(r[4].b).toEqual('e');
                done();
            })
            .catch(done);
    });

    test('truncated on top', (done) => {
        ezs.use(statements);
        const script = `
            [use]
            plugin = basics
            plugin = analytics

            [replace]
            path = id
            value = get('a')
            path = value
            value = get('b')

            [validate]
            path = id
            rule = required

            path = value
            rule = required

            [expand]
            size = 100
            path = value

            [expand/assign]
            path = value
            value = get('value').toUpper()

            [truncate]
            length = 3

            [replace]
            path = a
            value = get('id')
            path = b
            value = get('value')func(script)
        `;
        Promise.all(Array(size).fill(true).map(() => func(script)))
            .then((r) => {
                expect(r.length).toBe(size);
                expect(r[0].length).toBe(3);
                done();
            })
            .catch(done);
    });
});
test('deep script', (done) => {
    ezs.use(statements);
    ezs.use(statements);
    const input = Array(30).fill(true).map((i, index) => ({ a: index, b: ['a', 'b', 'c', 'd', 'e', 'f'] }));
    const output = [];
    const script = `
            [use]
            plugin = basics
            plugin = analytics

            [replace]
            path = id
            value = get('a')
            path = value
            value = get('b')

            [expand]
            path = value

            [expand/expand]
            path = value

            [expand/expand/exploding]

            [expand/expand/expand]
            path = value
            size = 5

            [expand/expand/expand/transit]

            [expand/expand/aggregate]

            [replace]
            path = a
            value = get('id')
            path = b
            value = get('value')

        `;
    from(input)
        .pipe(ezs('delegate', { script }))
        .pipe(ezs.catch())
        .on('error', done)
        .on('data', (chunk) => {
            output.push(chunk);
        })
        .on('end', () => {
            expect(output.length).toEqual(30);
            expect(output[0].a).toEqual(0);
            expect(output[5].b[0]).toEqual('a');
            done();
        });
}, 60000);

