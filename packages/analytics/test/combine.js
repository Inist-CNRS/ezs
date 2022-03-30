import assert from 'assert';
import fs from 'fs';
import from from 'from';
import ezs from '../../core/src';
import statements from '../src';

ezs.addPath(__dirname);

describe('combine', () => {
    test('with script #1', (done) => {
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
            path = value
            value = fix({id:'a', value:'aa'},{id:'b', value:'bb'},{id:'c', value:'cc'},{id:'d', value:'dd'},{id:'e', value:'ee'},{id:'f', value:'ff'})

            [exploding]
            [value]
        `;

        from(input)
            .pipe(ezs('combine', { path: 'b', script }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                assert.equal(output.length, 6);
                assert.equal(output[0].b.value, 'aa');
                assert.equal(output[1].b.value, 'bb');
                assert.equal(output[2].b.value, 'cc');
                assert.equal(output[3].b.value, 'dd');
                assert.equal(output[4].b.value, 'ee');
                assert.equal(output[5].b.value, 'ff');
                done();
            });
    });
    test('with script #1bis', (done) => {
        ezs.use(statements);
        const input = [
            { a: 1, b: 'a' },
            { a: 2, b: 'x' },
            { a: 3, b: 'c' },
            { a: 4, b: 'y' },
            { a: 5, b: 'e' },
            { a: 6, b: 'z' },
        ];
        const output = [];
        const script = `
            [use]
            plugin = analytics

            [replace]
            path = value
            value = fix({id:'a', value:'aa'},{id:'b', value:'bb'},{id:'c', value:'cc'},{id:'d', value:'dd'},{id:'e', value:'ee'},{id:'f', value:'ff'})

            [exploding]
            [value]
        `;

        from(input)
            .pipe(ezs('combine', { path: 'b', script }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                assert.equal(output.length, 6);
                assert.equal(output[0].b.value, 'aa');
                assert.equal(output[1].b.value, 'x');
                assert.equal(output[2].b.value, 'cc');
                assert.equal(output[3].b.value, 'y');
                assert.equal(output[4].b.value, 'ee');
                assert.equal(output[5].b.value, 'z');
                done();
            });
    });

    test('with script #1ter', (done) => {
        ezs.use(statements);
        const input = [
            { a: 1, b: 'a' },
            { a: 2, b: 'x' },
            { a: 3, b: 'c' },
            { a: 4, b: 'y' },
            { a: 5, b: 'e' },
            { a: 6, b: 'z' },
        ];
        const output = [];
        const script = `
            [use]
            plugin = analytics

            [replace]
            path = value
            value = fix({id:'a', value:'aa'},{id:'b', value:'bb'},{id:'c', value:'cc'},{id:'d', value:'dd'},{id:'e', value:'ee'},{id:'f', value:'ff'})

            [exploding]
            [value]
        `;

        from(input)
                .pipe(ezs('combine', { path: 'b', script, default: 'n/a' }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                assert.equal(output.length, 6);
                assert.equal(output[0].b.value, 'aa');
                assert.equal(output[1].b.value, 'n/a');
                assert.equal(output[2].b.value, 'cc');
                assert.equal(output[3].b.value, 'n/a');
                assert.equal(output[4].b.value, 'ee');
                assert.equal(output[5].b.value, 'n/a');
                done();
            });
    });

    test('with script #2', (done) => {
        ezs.use(statements);
        const input = [
            { a: 1, b: ['a'] },
            { a: 2, b: ['b', 'a'] },
            { a: 3, b: ['c', 'd'] },
            { a: 4, b: ['d', 'b', 'c'] },
            { a: 5, b: ['e'] },
            { a: 6, b: ['f'] },
        ];
        const output = [];
        const script = `
            [use]
            plugin = analytics

            [replace]
            path = value
            value = fix({id:'a', value:'aa'},{id:'b', value:'bb'},{id:'c', value:'cc'},{id:'d', value:'dd'},{id:'e', value:'ee'},{id:'f', value:'ff'})

            [exploding]
            [value]
        `;

        from(input)
            .pipe(ezs('combine', { path: 'b', script }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                assert.equal(output.length, 6);
                assert.equal(output[0].b[0].value, 'aa');
                assert.equal(output[1].b[0].value, 'bb');
                assert.equal(output[2].b[0].value, 'cc');
                assert.equal(output[3].b[0].value, 'dd');
                assert.equal(output[4].b[0].value, 'ee');
                assert.equal(output[5].b[0].value, 'ff');
                done();
            });
    });
    test('with script #3', (done) => {
        ezs.use(statements);
        const input = [
            { a: 1, b: 'a' },
            { a: 2, b: 'x' },
            { a: 3, b: 'c' },
            { a: 4, b: 'y' },
            { a: 5, b: 'e' },
            { a: 6, b: 'z' },
        ];
        const output = [];
        const script = `
            [use]
            plugin = analytics

            [replace]
            path = value
            value = fix({id:'a', value:'aa'},{id:'b', value:'bb'},{id:'c', value:'cc'},{id:'d', value:'dd'},{id:'e', value:'ee'},{id:'f', value:'ff'})

            [exploding]
            [value]
        `;

        from(input)
            .pipe(ezs('combine', { path: 'b', script }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                assert.equal(output.length, 6);
                assert.equal(output[0].b.value, 'aa');
                assert.equal(output[1].b.value, 'x');
                assert.equal(output[2].b.value, 'cc');
                assert.equal(output[3].b.value, 'y');
                assert.equal(output[4].b.value, 'ee');
                assert.equal(output[5].b.value, 'z');
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
        const file = './datasource01.ini';

        from(input)
            .pipe(ezs('combine', { path: 'b', file }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                assert.equal(output.length, 6);
                assert.equal(output[0].b.value, 'aa');
                assert.equal(output[1].b.value, 'bb');
                assert.equal(output[2].b.value, 'cc');
                assert.equal(output[3].b.value, 'dd');
                assert.equal(output[4].b.value, 'ee');
                assert.equal(output[5].b.value, 'ff');
                done();
            });
    });
});
describe('no combine', () => {
    test('with script', (done) => {
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
            path = value
            value = fix({id:'a', value:'aa'},{id:'b', value:'bb'},{id:'c', value:'cc'},{id:'d', value:'dd'},{id:'e', value:'ee'},{id:'f', value:'ff'})

            [exploding]
            [value]
        `;

        from(input)
            .pipe(ezs('combine', { path: 'no exiting path', script }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                assert.equal(output.length, 6);
                assert.equal(output[0].b, 'a');
                assert.equal(output[1].b, 'b');
                assert.equal(output[2].b, 'c');
                assert.equal(output[3].b, 'd');
                assert.equal(output[4].b, 'e');
                assert.equal(output[5].b, 'f');
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

            [files]
            location = ${__dirname}
        `;
        const filename = `${__dirname}/forbidden`;
        fs.writeFileSync(filename, 'secret', 'utf8');
        fs.chmodSync(filename, 0o333, done);
        from(input)
            .pipe(ezs('combine', { script, primer: 'forbidden' }))
            .pipe(ezs.catch())
            .on('error', () => {
                fs.unlinkSync(filename);
                done();
            })
            .on('end', () => {
                fs.unlinkSync(filename);
                done(new Error('Error is the right behavior'));
            });
    });
    test('with no in script', (done) => {
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
            .pipe(ezs('combine'))
            .pipe(ezs.catch())
            .on('error', () => {
                done();
            })
            .on('end', () => {
                done(new Error('Error is the right behavior'));
            });
    });
    test('with wrong location', (done) => {
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
            value = fix({id:'a', value:'aa'},{id:'b', value:'bb'},{id:'c', value:'cc'},{id:'d', value:'dd'},{id:'e', value:'ee'},{id:'f', value:'ff'})

            [exploding]
            [value]
        `;

        from(input)
            .pipe(ezs('combine', { path: 'b', script, location: '/no/where' }))
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
});

const env = {
    executed: false,
};
const cacheName = Date.now();

test('combine with cache with script #1', (done) => {
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

            [env]
            path = executed
            value = fix(true)

            [replace]
            path = value
            value = fix({id:'a', value:'aa'},{id:'b', value:'bb'},{id:'c', value:'cc'},{id:'d', value:'dd'},{id:'e', value:'ee'},{id:'f', value:'ff'})

            [exploding]
            [value]
        `;

    from(input)
        .pipe(ezs('combine', { path: 'b', script, cacheName }, env))
        .pipe(ezs.catch())
        .on('error', done)
        .on('data', (chunk) => {
            output.push(chunk);
        })
        .on('end', () => {
            assert.equal(output.length, 6);
            assert.equal(output[0].b.value, 'aa');
            assert.equal(output[1].b.value, 'bb');
            assert.equal(output[2].b.value, 'cc');
            assert.equal(output[3].b.value, 'dd');
            assert.equal(output[4].b.value, 'ee');
            assert.equal(output[5].b.value, 'ff');
            assert.equal(env.executed, true);
            env.executed = false;
            done();
        });
});

test('combine with cache with script #2', (done) => {
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

            [env]
            path = executed
            value = fix(true)

            [replace]
            path = value
            value = fix({id:'a', value:'aa'},{id:'b', value:'bb'},{id:'c', value:'cc'},{id:'d', value:'dd'},{id:'e', value:'ee'},{id:'f', value:'ff'})

            [exploding]
            [value]
        `;

    from(input)
        .pipe(ezs('combine', { path: 'b', script, cacheName }, env))
        .pipe(ezs.catch())
        .on('error', done)
        .on('data', (chunk) => {
            output.push(chunk);
        })
        .on('end', () => {
            assert.equal(output.length, 6);
            assert.equal(output[0].b.value, 'aa');
            assert.equal(output[1].b.value, 'bb');
            assert.equal(output[2].b.value, 'cc');
            assert.equal(output[3].b.value, 'dd');
            assert.equal(output[4].b.value, 'ee');
            assert.equal(output[5].b.value, 'ff');
            assert.equal(env.executed, false);
            done();
        });
});


