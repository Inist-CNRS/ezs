const assert = require('assert');
const fs = require('fs');
const ezs = require('../../core/src');

ezs.use(require('../src'));

describe('ZIPExtract', () => {
    it('should extract JSON content', (done) => {
        const result = [];
        fs.createReadStream('./packages/basics/examples/data/test.zip')
            .pipe(ezs('ZIPExtract'))
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

    it('should extract TXT content', (done) => {
        const result = [];
        fs.createReadStream('./packages/basics/examples/data/test.zip')
            .pipe(ezs('ZIPExtract', { path: '**/*.txt' }))
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
