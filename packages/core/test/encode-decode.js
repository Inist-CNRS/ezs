import assert from 'assert';
import from from 'from';
import ezs from '../src';

ezs.use(require('./locals'));

ezs.addPath(__dirname);

ezs.settings.servePath = __dirname;

describe('encode/decode', () => {
    test('base64', (done) => {
        const input = [
            { a: 1, b: 'a' },
            { a: 2, b: 'b' },
            { a: 3, b: 'c' },
            { a: 33, b: {} },
            { a: 4, b: 'd' },
            { a: 44, b: null },
            { a: 5, b: 'e' },
        ];
        const res = [];
        const script = `
            [encode]
            path = b
            mode = base64
            [debug]
            [decode]
            path = b
            mode = base64
        `;
        from(input)
            .pipe(ezs('delegate', {
                script,
            }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(7, res.length);
                assert.equal(input[0].b, res[0].b);
                assert.equal(input[1].b, res[1].b);
                assert.equal(input[2].b, res[2].b);
                assert.equal(input[3].b, res[3].b);
                assert.equal(input[4].b, res[4].b);
                assert.equal(input[5].b, res[5].b);
                done();
            });
    });
    test('uri', (done) => {
        const input = [
            { a: 1, b: 'a' },
            { a: 2, b: 'b' },
            { a: 3, b: 'c' },
            { a: 33, b: {} },
            { a: 4, b: 'd' },
            { a: 44, b: null },
            { a: 5, b: 'e' },
        ];
        const res = [];
        const script = `
            [encode]
            path = b
            mode = uri
            [debug]
            [decode]
            path = b
            mode = uri
        `;
        from(input)
            .pipe(ezs('delegate', {
                script,
            }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(7, res.length);
                assert.equal(input[0].b, res[0].b);
                assert.equal(input[1].b, res[1].b);
                assert.equal(input[2].b, res[2].b);
                assert.equal(input[3].b, res[3].b);
                assert.equal(input[4].b, res[4].b);
                assert.equal(input[5].b, res[5].b);
                done();
            });
    });
    test('uuid', (done) => {
        const input = [
            { a: 1, b: 'a' },
            { a: 2, b: 'b' },
            { a: 3, b: 'c' },
            { a: 33, b: {} },
            { a: 4, b: 'd' },
            { a: 44, b: null },
            { a: 5, b: 'e' },
        ];
        const res = [];
        const script = `
            [encode]
            path = b
            mode = uuid
            [debug]
            [decode]
            path = b
            mode = uuid
        `;
        from(input)
            .pipe(ezs('delegate', {
                script,
            }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(7, res.length);
                assert.equal(input[0].b, res[0].b);
                assert.equal(input[1].b, res[1].b);
                assert.equal(input[2].b, res[2].b);
                assert.equal(input[3].b, res[3].b);
                assert.equal(input[4].b, res[4].b);
                assert.equal(input[5].b, res[5].b);
                done();
            });
    });
})

