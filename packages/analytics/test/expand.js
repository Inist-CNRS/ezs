import fs from 'fs';
import from from 'from';
import ezs from '../../core/src';
import statements from '../src';

ezs.addPath(__dirname);

test('with script (all values)', (done) => {
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
            expect(e).toEqual(expect.not.stringContaining('permission denied'));
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
            expect(e).toEqual(expect.not.stringContaining('Invalid parmeter'));
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
            expect(e).toEqual(expect.not.stringContaining('key cannot be `null`'));
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
            expect(e).toEqual(expect.not.stringContaining('id was corrupted'));
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
            expect(e).toEqual(expect.not.stringContaining('id was corrupted'));
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
            expect(e).toEqual(expect.not.stringContaining('BADVAL is not defined'));
            expect(output.length).toEqual(0);
            done();
        })
        .on('end', () => {
            done(new Error('Error is the right behavior'));
        });
});
