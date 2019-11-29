const assert = require('assert');
const fs = require('fs');
const ezs = require('../../core/src');

ezs.use(require('../src'));

describe('ZIPExtract', () => {
    it('should extract JSON content', (done) => {
        const result = [];
        fs.createReadStream('./packages/basics/examples/data/test.zip')
            .pipe(ezs('ZIPExtract'))
            .on('data', (chunk) => {
                assert.equal(chunk.test, 'ok');
                result.push(chunk);
            })
            .on('error', done)
            .on('end', () => {
                assert.equal(result.length, 10);
                done();
            });
    });

    it('should extract TXT content', (done) => {
        const result = [];
        fs.createReadStream('./packages/basics/examples/data/test.zip')
            .pipe(ezs('ZIPExtract', { json: false, path: '**/*.txt' }))
            .on('data', (chunk) => {
                assert.equal(chunk.value, 'ok\n');
                result.push(chunk);
            })
            .on('error', done)
            .on('end', () => {
                assert.equal(result.length, 10);
                done();
            });
    });

    it('should failed to extract JSON from TXT content', (done) => {
        const result = [];
        fs.createReadStream('./packages/basics/examples/data/test.zip')
            .pipe(ezs('ZIPExtract', { json: true, path: '**/*.txt' }))
            .pipe(ezs.catch())
            .on('error', (e) => {
                assert.ok(e instanceof Error);
                result.push(e);
                done();
            })
            .on('data', () => {
                throw new Error('should emit error');
            })
            .on('end', () => {
                assert.equal(result.length, 10);
                done();
            });
    });
});
