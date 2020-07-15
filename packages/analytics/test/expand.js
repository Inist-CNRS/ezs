import assert from 'assert';
import fs from 'fs';
import from from 'from';
import ezs from '../../core/src';
import statements from '../src';

ezs.addPath(__dirname);
ezs.use(statements);

describe('expand', () => {
    test('with script', (done) => {
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
                assert.equal(output.length, 6);
                assert.equal(output[0].b, 'A');
                assert.equal(output[1].b, 'B');
                assert.equal(output[2].b, 'C');
                assert.equal(output[3].b, 'D');
                assert.equal(output[4].b, 'E');
                assert.equal(output[5].b, 'F');
                done();
            });
    });
    test('with file', (done) => {
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
                assert.equal(output.length, 6);
                assert.equal(output[0].b, 'A');
                assert.equal(output[1].b, 'B');
                assert.equal(output[2].b, 'C');
                assert.equal(output[3].b, 'D');
                assert.equal(output[4].b, 'E');
                assert.equal(output[5].b, 'F');
                done();
            });
    });
});
describe('no expand', () => {
    test('with script', (done) => {
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
            .pipe(ezs('expand', { path: 'no exiting path', script }))
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
            .on('error', () => {
                fs.unlinkSync(filename);
                done();
            })
            .on('end', () => {
                fs.unlinkSync(filename);
                done(new Error('Error is the right behavior'));
            });
    });
    test('with no script', (done) => {
        const input = [
            { a: 1, b: 'a' },
            { a: 2, b: 'b' },
            { a: 3, b: 'c' },
            { a: 4, b: 'd' },
            { a: 5, b: 'e' },
            { a: 6, b: 'f' },
        ];
        from(input)
            .pipe(ezs('expand'))
            .pipe(ezs.catch())
            .on('error', () => {
                done();
            })
            .on('end', () => {
                done(new Error('Error is the right behavior'));
            });
    });
    test('with no path', (done) => {
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

            [exchange]
            value = forbidden
            [files]
            location = ${__dirname}
        `;
        from(input)
            .pipe(ezs('expand', { script }))
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
});
