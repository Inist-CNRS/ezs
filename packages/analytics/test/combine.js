import assert from 'assert';
import fs from 'fs';
import from from 'from';
import ezs from '../../core/src';
import statements from '../src';

ezs.addPath(__dirname);
ezs.use(statements);

describe('combine', () => {
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
        fs.chmodSync(`${__dirname}/forbidden`, 0o333, done);
        from(input)
            .pipe(ezs('combine', { script, primer: 'forbidden' }))
            .pipe(ezs.catch())
            .on('error', () => {
                done();
            })
            .on('end', () => {
                done(new Error('Error is the right behavior'));
            });
    });
    test('with no in script', (done) => {
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
});
