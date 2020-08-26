import assert from 'assert';
import fs from 'fs';

import ezs from '../../core/src';

ezs.use(require('../src'));
ezs.use(require('../../basics/src'));

describe('ISTEXUnzip', () => {
    it('should get 10 elements', (done) => {
        const result = [];
        fs.createReadStream('./packages/istex/examples/data/istex-subset-2019-03-15-10.zip')
            .pipe(ezs('ISTEXUnzip'))
        // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('error', done)
            .on('end', () => {
                assert.equal(result.length, 10);
                done();
            });
    });

    it('should get 10 elements (with delegate)', (done) => {
        const script = `
          [use]
          #plugin = istex
          plugin = ./packages/istex
          [ISTEXUnzip]
      `;
        const result = [];
        fs.createReadStream('./packages/istex/examples/data/istex-subset-2019-03-15-10.zip')
            .pipe(ezs('delegate', { script }))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('error', done)
            .on('end', () => {
                assert.equal(result.length, 10);
                done();
            });
    });


    it('should get JSON objects', (done) => {
        const result = [];
        fs.createReadStream('./packages/istex/examples/data/istex-subset-2019-03-15-10.zip')
            .pipe(ezs('ISTEXUnzip'))
        // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('error', done)
            .on('end', () => {
                assert(result.length > 1);
                assert.equal(typeof result[0], 'object');
                done();
            });
    });

    it('should get proper first JSON object', (done) => {
        const result = [];
        fs.createReadStream('./packages/istex/examples/data/istex-subset-2019-03-15-10.zip')
            .pipe(ezs('ISTEXUnzip'))
        // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('error', done)
            .on('end', () => {
                assert(result.length > 1);
                assert.equal(typeof result[0], 'object');
                assert.equal(result[0].arkIstex, 'ark:/67375/56L-Z1WPCL8D-T');
                assert.equal(result[0].title,
                    'A case of diabetes, with an historical sketch of that disease. By Thomas Girdlestone, M.D.');
                assert.equal(result[0].language[0], 'eng');
                assert.equal(result[0].publicationDate, '1799');
                assert.equal(result[0].corpusName, 'ecco');
                assert.equal(result[0].qualityIndicators.score, 0.062);
                done();
            });
    });

    it('should get proper last JSON object', (done) => {
        const result = [];
        fs.createReadStream('./packages/istex/examples/data/istex-subset-2019-03-15-10.zip')
            .pipe(ezs('ISTEXUnzip'))
        // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('error', done)
            .on('end', () => {
                assert(result.length > 1);
                assert.equal(typeof result[9], 'object');
                assert.equal(result[9].arkIstex, 'ark:/67375/0T8-SLF4HPPC-X');
                assert.equal(result[9].title,
                    // eslint-disable-next-line max-len
                    'Breath acetone concentration decreases with blood glucose concentration in type I diabetes mellitus patients during hypoglycaemic clamps');
                assert.equal(result[9].language[0], 'eng');
                assert.equal(result[9].publicationDate, '2009');
                assert.equal(result[9].corpusName, 'iop');
                assert.equal(result[9].qualityIndicators.score, 8.247);
                done();
            });
    });

    it('should work on 1000 elements', (done) => {
        const result = [];
        fs.createReadStream('./packages/istex/examples/data/istex-subset-2019-03-15-1000.zip')
            .pipe(ezs('ISTEXUnzip'))
        // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('error', done)
            .on('end', () => {
                assert.equal(result.length, 1000);
                assert.equal(typeof result[999], 'object');
                assert.equal(result[999].arkIstex, 'ark:/67375/QHD-X7WSJP9K-C');
                assert.equal(result[999].title, 'Physiological chemistry');
                assert.equal(result[999].language[0], 'eng');
                assert.equal(result[999].publicationDate, '1894');
                assert.equal(result[999].corpusName, 'rsc-journals');
                assert.equal(result[999].qualityIndicators.score, 2.699);
                done();
            });
    }, 10000);

    it('should return error when unzipping file', (done) => {
        fs.createReadStream('./packages/istex/test/data/istexUnzip.zip')
            .pipe(ezs('ISTEXUnzip'))
            // .pipe(ezs('debug'))
            .pipe(ezs.catch())
            .on('error', (e) => {
                assert(e instanceof Error);
                assert(e.message.includes('failed with Error: FILE_ENDED'));
                done();
            });
    });
});
