import assert from 'assert';
import from from 'from';
import ezs from '../src';
import statements from '../src/statements';

ezs.use(statements);

describe('[dedupe]', () => {
    it('with error (1)', (done) => {
        const input = [
            { a: 1, b: 'a' },
            { a: 1, b: 'b' },
            { a: 3, b: 'c' },
            { a: 4, b: 'd' },
            { a: 5, b: 'e' },
            { a: 6, b: 'f' },
        ];
        const output = [];
        from(input)
            .pipe(ezs('dedupe', { path: ['a', 'c'] }))
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                assert.equal(output.length, 6);
                assert.ok(output[1] instanceof Error);
                assert.ok(output[1].message.includes('Duplicate identifier: 1 already exists'));
                done();
            });
    });
    it('with error (2)', (done) => {
        const input = [
            { a: 1, b: 'a' },
            { a: 1, b: 'b' },
            { a: 3, b: 'c' },
            { a: 3, b: 'd' },
            { a: 4, b: 'e' },
            { a: 4, b: 'f' },
        ];
        const output = [];
        from(input)
            .pipe(ezs('dedupe', { path: 'a' }))
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                assert.equal(output.length, 6);
                assert.ok(output[1] instanceof Error);
                assert.ok(output[3] instanceof Error);
                assert.ok(output[5] instanceof Error);
                done();
            });
    });
    it('with ignore (1)', (done) => {
        const input = [
            { a: 1, b: 'a' },
            { a: 1, b: 'b' },
            { a: 3, b: 'c' },
            { a: 4, b: 'd' },
            { a: 5, b: 'e' },
            { a: 6, b: 'f' },
        ];
        const output = [];
        from(input)
            .pipe(ezs('dedupe', { path: ['a', 'c'], ignore: true }))
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                assert.equal(output.length, 5);
                done();
            });
    });
    it('with ignore (2)', (done) => {
        const input = [
            { a: 1, b: 'a' },
            { a: 1, b: 'b' },
            { a: 3, b: 'c' },
            { a: 3, b: 'd' },
            { a: 4, b: 'e' },
            { a: 4, b: 'f' },
        ];
        const output = [];
        from(input)
            .pipe(ezs('dedupe', { path: 'a', ignore: true }))
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                assert.equal(output.length, 3);
                done();
            });
    });
    it('with no uri', (done) => {
        const input = [
            { a: 1, b: 'a' },
            { a: 1, b: 'b' },
            { a: 3, b: 'c' },
            { a: 3, b: 'd' },
            { a: 4, b: 'e' },
            { a: 4, b: 'f' },
        ];
        const output = [];
        from(input)
            .pipe(ezs('dedupe'))
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                assert.equal(output.length, 6);
                assert.ok(output[0] instanceof Error);
                assert.ok(output[0].message.includes('uri field not exists, enable to dedupe.'));
                assert.ok(output[1] instanceof Error);
                assert.ok(output[2] instanceof Error);
                assert.ok(output[3] instanceof Error);
                assert.ok(output[4] instanceof Error);
                assert.ok(output[5] instanceof Error);
                done();
            });
    });
    it('with no uri (ignore)', (done) => {
        const input = [
            { a: 1, b: 'a' },
            { a: 1, b: 'b' },
            { a: 3, b: 'c' },
            { a: 3, b: 'd' },
            { a: 4, b: 'e' },
            { a: 4, b: 'f' },
        ];
        const output = [];
        from(input)
            .pipe(ezs('dedupe', { ignore: true }))
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                assert.equal(output.length, 0);
                done();
            });
    });
});

