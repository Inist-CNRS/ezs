const assert = require('assert');
const fs = require('fs');
const ezs = require('../../core/src');

ezs.use(require('../src'));

describe('TARExtract', () => {
    it('should extract JSON content (manual)', (done) => {
        const result = [];
        fs.createReadStream('./packages/basics/examples/data/test.tar')
            .pipe(ezs('TARExtract', { json: false }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                const obj = JSON.parse(chunk.value.toString());
                assert.equal(obj.test, 'ok');
                result.push(obj);
            })
            .on('end', () => {
                assert.equal(result.length, 10);
                done();
            });
    });
    it('should extract JSON content (default)', (done) => {
        const result = [];
        fs.createReadStream('./packages/basics/examples/data/test.tar')
            .pipe(ezs('TARExtract'))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                assert.equal(chunk.test, 'ok');
                result.push(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 10);
                done();
            });
    });
    it('should extract JSON content (default) + tar.gz', (done) => {
        const result = [];
        fs.createReadStream('./packages/basics/examples/data/test.tar.gz')
            .pipe(ezs('TARExtract', { compress: true }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                assert.equal(chunk.test, 'ok');
                result.push(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 10);
                done();
            });
    });
    it('should extract TXT content', (done) => {
        const result = [];
        fs.createReadStream('./packages/basics/examples/data/test.tar')
            .pipe(ezs('TARExtract', { path: '**/*.txt', json: false }))
            .pipe(ezs.catch())
            .on('data', (chunk) => {
                const str = chunk.value.toString();
                assert.equal(str, 'ok\n');
                result.push(str);
            })
            .on('error', done)
            .on('end', () => {
                assert.equal(result.length, 10);
                done();
            });
    });
});
