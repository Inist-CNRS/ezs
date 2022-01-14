import from from 'from';
import ezs from '../../core';
import analytics from '../../analytics';
import statements from '../src';
import pool from '../src/pool';

ezs.addPath(__dirname);
ezs.use(analytics);

pool.config.cwd = __dirname;

describe('exec', () => {
    afterAll(() => pool.shutdown());

    test('cat', (done) => {
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

            [exec]
            command = cat

        `;
        from(input)
            .pipe(ezs('delegate', { script }))
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
    test('sort', (done) => {
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
            [exec]
            path = b
            command = sort
            args = --reverse
        `;
        from(input)
            .pipe(ezs('delegate', { script }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                done();
                expect(output.length).toEqual(6);
                expect(output[0].b).toEqual('f');
                expect(output[1].b).toEqual('e');
                expect(output[2].b).toEqual('d');
                expect(output[3].b).toEqual('c');
                expect(output[4].b).toEqual('b');
                expect(output[5].b).toEqual('a');
            });
    });
    test('cmd.sh', (done) => {
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

            [exec]
            path = b
            command = ./cmd.sh
            [replace]
            path = a
            value = get('A')
            path = b
            value = get('B')

        `;
        from(input)
            .pipe(ezs('delegate', { script }))
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
    test('cmd.py', (done) => {
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
            [replace]
            path = id
            value = get('a')
            path = value
            value = get('b')

            [exec]
            command = ./cmd.py

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
    test('cmd.py (with expand) size 10', (done) => {
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
            [expand]
            size = 10
            path = b
            [expand/exec]
            command = ./cmd.py
        `;
        from(input)
            .pipe(ezs('delegate', { script }))
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
    test('cmd.py (with expand) size 3', (done) => {
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
            [expand]
            size = 3
            path = b
            [expand/exec]
            command = ./cmd.py
        `;
        from(input)
            .pipe(ezs('delegate', { script }))
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
    test('nonexisting file', (done) => {
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
            [exec]
            command = ./fake_command
        `;
        from(input)
            .pipe(ezs('delegate', { script }))
            .pipe(ezs.catch())
            .on('error', (e) => {
                expect(e.message).toEqual(expect.stringContaining('ENOENT'));
                done();
            })
            .on('end', () => {
                done(new Error('Error is the right behavior'));
            });
    });
    test('bad file', (done) => {
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
            [exec]
            path = b
            command = ./ko.py
            [assign]
            path = b
            value = get('b.value')
        `;
        from(input)
            .pipe(ezs('delegate', { script }))
            .pipe(ezs.catch())
            .on('error', (e) => {
                expect(e.message).toEqual(expect.stringContaining('ko.py exit with code 1'));
                done();
            })
            .on('end', () => {
                done(new Error('Error is the right behavior'));
            });
    });
});
