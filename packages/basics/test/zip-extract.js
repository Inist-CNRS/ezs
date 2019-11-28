const assert = require('assert');
const fs = require('fs');
const ezs = require('../../core/src');

ezs.use(require('../src'));

describe('ZIPExtract', () => {
    it('should extract json files', (done) => {
    });
});


describe('ISTEXUnzip', () => {
    it('should extract JSON content', (done) => {
        const result = [];
        fs.createReadStream('./packages/basics/examples/data/test.zip')
            .pipe(ezs('ZIPExtract'))
            .on('data', (chunk) => {
                assert.equal(result.test, 'ok');
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
                assert.equal(result, 'ok');
                result.push(chunk);
            })
            .on('error', done)
            .on('end', () => {
                assert.equal(result.length, 10);
                done();
            });
    });

    it('should faile to extract JSON from TXT content', (done) => {
        const result = [];
        fs.createReadStream('./packages/basics/examples/data/test.zip')
            .pipe(ezs('ZIPExtract', { json: true, path: '**/*.txt' }))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('error', done)
            .on('end', () => {
                assert.equal(result.length, 10);
                done();
            });
    });
});
