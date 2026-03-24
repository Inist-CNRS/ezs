import from from 'from';
import ezs from '../../core/src';
import analytics from '../../analytics/src';
import statements from '../src';
import pool from '../src/pool';

ezs.addPath(__dirname);
ezs.use(analytics);

pool.config.cwd = __dirname;

const streamToPromise = (stream, onData, onEnd, onError) => new Promise((resolve, reject) => {
    stream
        .on('error', onError ? (e) => { try { onError(e); resolve(); } catch(err) { reject(err); } } : reject)
        .on('data', (chunk) => { try { onData(chunk); } catch(e) { reject(e); } })
        .on('end', () => { try { onEnd(); resolve(); } catch(e) { reject(e); } });
});

describe('exec', () => {
    afterAll(async () => {
        await pool.shutdown();
    });

    test('cat', () => {
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
        return streamToPromise(
            from(input).pipe(ezs('delegate', { script })).pipe(ezs.catch()),
            (chunk) => output.push(chunk),
            () => {
                expect(output.length).toEqual(6);
                expect(output[0].b).toEqual('a');
                expect(output[1].b).toEqual('b');
                expect(output[2].b).toEqual('c');
                expect(output[3].b).toEqual('d');
                expect(output[4].b).toEqual('e');
                expect(output[5].b).toEqual('f');
            },
        );
    });

    test('sort', () => {
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
        return streamToPromise(
            from(input).pipe(ezs('delegate', { script })).pipe(ezs.catch()),
            (chunk) => output.push(chunk),
            () => {
                expect(output.length).toEqual(6);
                expect(output[0].b).toEqual('f');
                expect(output[1].b).toEqual('e');
                expect(output[2].b).toEqual('d');
                expect(output[3].b).toEqual('c');
                expect(output[4].b).toEqual('b');
                expect(output[5].b).toEqual('a');
            },
        );
    });

    test('cmd.sh', () => {
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
        return streamToPromise(
            from(input).pipe(ezs('delegate', { script })).pipe(ezs.catch()),
            (chunk) => output.push(chunk),
            () => {
                expect(output.length).toEqual(6);
                expect(output[0].b).toEqual('A');
                expect(output[1].b).toEqual('B');
                expect(output[2].b).toEqual('C');
                expect(output[3].b).toEqual('D');
                expect(output[4].b).toEqual('E');
                expect(output[5].b).toEqual('F');
            },
        );
    });

    test('cmd.sh (concurrency = 0)', () => {
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
            concurrency = 0
            [replace]
            path = a
            value = get('A')
            path = b
            value = get('B')
        `;
        return streamToPromise(
            from(input).pipe(ezs('delegate', { script })).pipe(ezs.catch()),
            (chunk) => output.push(chunk),
            () => {
                expect(output.length).toEqual(6);
                expect(output[0].b).toEqual('A');
                expect(output[1].b).toEqual('B');
                expect(output[2].b).toEqual('C');
                expect(output[3].b).toEqual('D');
                expect(output[4].b).toEqual('E');
                expect(output[5].b).toEqual('F');
            },
        );
    });

    test('cmd.py', () => {
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
        return streamToPromise(
            from(input).pipe(ezs('delegate', { script })).pipe(ezs.catch()),
            (chunk) => output.push(chunk),
            () => {
                expect(output.length).toEqual(6);
                expect(output[0].b).toEqual('A');
                expect(output[1].b).toEqual('B');
                expect(output[2].b).toEqual('C');
                expect(output[3].b).toEqual('D');
                expect(output[4].b).toEqual('E');
                expect(output[5].b).toEqual('F');
            },
        );
    });

    test('cmd.py (with expand) size 10', () => {
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
        return streamToPromise(
            from(input).pipe(ezs('delegate', { script })).pipe(ezs.catch()),
            (chunk) => output.push(chunk),
            () => {
                expect(output.length).toEqual(6);
                expect(output[0].b).toEqual('A');
                expect(output[1].b).toEqual('B');
                expect(output[2].b).toEqual('C');
                expect(output[3].b).toEqual('D');
                expect(output[4].b).toEqual('E');
                expect(output[5].b).toEqual('F');
            },
        );
    });

    test('cmd.py (with expand) size 3', () => {
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
        return streamToPromise(
            from(input).pipe(ezs('delegate', { script })).pipe(ezs.catch()),
            (chunk) => output.push(chunk),
            () => {
                expect(output.length).toEqual(6);
                expect(output[0].b).toEqual('A');
                expect(output[1].b).toEqual('B');
                expect(output[2].b).toEqual('C');
                expect(output[3].b).toEqual('D');
                expect(output[4].b).toEqual('E');
                expect(output[5].b).toEqual('F');
            },
        );
    });

    test('bad file', () => {
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
        return streamToPromise(
            from(input).pipe(ezs('delegate', { script })).pipe(ezs.catch()),
            () => {},
            () => { throw new Error('Error is the right behavior'); },
            (e) => {
                expect(e.message).toEqual(expect.stringContaining('ko.py'));
            },
        );
    });

    test('nonexisting file', () => {
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
        return streamToPromise(
            from(input).pipe(ezs('delegate', { script })).pipe(ezs.catch()),
            () => {},
            () => { throw new Error('Error is the right behavior'); },
            (e) => {
                expect(e.message).toEqual(expect.stringContaining('ENOENT'));
            },
        );
    });

    describe('exec (with preload)', () => {
        ezs.use(statements);
        const call = (resolve, reject) => {
            const input = [
                { a: 1, b: 'a' },
                { a: 2, b: 'b' },
                { a: 3, b: 'c' },
                { a: 4, b: 'd' },
                { a: 5, b: 'e' },
                { a: 6, b: 'f' },
            ];
            const script = `
            [replace]
            path = id
            value = get('a')
            path = value
            value = get('b')

            [exec]
            command = ./slow.py
            concurrency = 6

            [replace]
            path = a
            value = get('id')
            path = b
            value = get('value')
        `;
            const output = [];
            from(input)
                .pipe(ezs('delegate', { script }))
                .pipe(ezs.catch())
                .on('error', (e) => reject(e))
                .on('data', (chunk) => {
                    output.push(chunk);
                })
                .on('end', () => resolve(output));
        };
        beforeAll(async () => {
            await new Promise(call);
            await new Promise((r) => setTimeout(r, 30000));
        }, 60000);

        test('slow.py (1)', async () => {
            await Promise.all([
                await new Promise(call),
                await new Promise(call),
                await new Promise(call),
                await new Promise(call),
            ]);
            const output = await new Promise(call);
            expect(output.length).toEqual(6);
            expect(output[0].b).toEqual('A');
            expect(output[1].b).toEqual('B');
            expect(output[2].b).toEqual('C');
            expect(output[3].b).toEqual('D');
            expect(output[4].b).toEqual('E');
            expect(output[5].b).toEqual('F');
        }, 60000);
    });
});
