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
test('with wrong location ', (done) => {
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

            [assign]
            path = value
            value = get('value').toUpper()
        `;
    from(input)
        .pipe(ezs('expand', { path: 'b', script, location: '/no/where' }))
        .pipe(ezs.catch())
        .on('error', (e) => {
            expect(e.message).toEqual(expect.stringContaining('EACCES: permission denied'));
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
            expect(e.message).toEqual(expect.stringContaining('key cannot be `null`'));
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

test('with script (all values) #1 with cache', (done) => {
    ezs.use(statements);
    const output = [];
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
            expect(env.executed).toEqual(true);
            env.executed = false;
            done();
        });
});

test('with script (all values) #2 with cache', (done) => {
    ezs.use(statements);
    const output = [];
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
            expect(env.executed).toEqual(false);
            done();
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
            expect(output.length).toEqual(6);
            expect(output[0].b).toEqual('A');
            expect(output[1].b).toEqual('B');
            expect(output[2].b).toEqual('c');
            expect(output[3].b).toEqual('D');
            expect(output[4].b).toEqual('E');
            expect(output[5].b).toEqual('F');
            expect(env.executed).toEqual(false);
            done();
        });
});
describe('with sub script and brute force write', () => {
    const size = 50;
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
    });

    beforeAll(() => jest.setTimeout(60000));
    afterAll(() => jest.setTimeout(5000));

    test('with no error', (done) => {
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

    test('stopped with erratic error', (done) => {
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


    test('corrupted with erratic error', (done) => {
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
            .then(() => {
                // expand extract error because a error in sub pipeline cannot be rejectied in the main pipeline (no id)
                done(new Error('Error is the right behavior'));
            })
            .catch((e) => {
                expect(e.message).toEqual(expect.stringContaining('Erratic Error'));
                done();
            });
    });

    test('improper with erratic error', (done) => {
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
    test('improper with erratic error', (done) => {
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
});
