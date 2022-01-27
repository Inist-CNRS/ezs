import assert from 'assert';
import from from 'from';
import fs from 'fs';
import path from 'path';
import nock from 'nock';

import ezs from '../../core/src';
import istexParseDotCorpusData from './data/istexParseDotCorpus.json';

const istexApiUrl = 'https://api.istex.fr';
const nockScope = nock(istexApiUrl)
    // .log(console.log)
    .persist(false);

ezs.use(require('../src'));
ezs.use(require('../../basics/src'));

describe('ISTEXParseDotCorpus', () => {
    it('should parse identifiers', (done) => {
        const result = [];
        const corpus = fs.readFileSync(path.resolve(__dirname,
            './1notice.corpus'));
        nockScope
            .get('/document/2FF3F5B1477986B9C617BB75CA3333DBEE99EB05?sid=ezs-istex')
            .reply(200, istexParseDotCorpusData[0]);

        from([
            corpus.toString(),
        ])
            .pipe(ezs('ISTEXParseDotCorpus'))
            // .pipe(ezs('debug'))
            .pipe(ezs.catch(e => e)) // catch errors in chunks and throw a error, which breaking the pipeline
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 1);
                assert(result[0]);
                assert.equal(result[0].publisher, 'CNRS');
                assert.equal(result[0].id,
                    '2FF3F5B1477986B9C617BB75CA3333DBEE99EB05');
                done();
            })
            .on('error', console.error);
    });

    it('should parse query', (done) => {
        const result = [];
        const corpus = fs.readFileSync(path.resolve(__dirname,
            './1query.corpus'));
        nockScope
            .get('/document/?q=language.raw%3Arum&scroll=5m&output=arkIstex%2Cdoi%2Cauthor%2Ctitle'
              + '%2Clanguage%2CpublicationDate%2Ckeywords%2Chost%2Cfulltext&size=2000&sid=ezs-istex')
            .reply(200, istexParseDotCorpusData[1]);

        from([
            corpus.toString(),
        ])
            .pipe(ezs('ISTEXParseDotCorpus'))
            // .pipe(ezs('debug'))
            .pipe(ezs.catch(e => e)) // catch errors in chunks and throw a error, which breaking the pipeline
            .on('error', done)
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert(result.length > 0);
                assert(result[0]);
                assert.equal(result[0].publisher, 'CNRS');
                done();
            });
    });

    it('should return error on parse empty corpus', (done) => {
        from([
            '',
        ])
            .pipe(ezs('ISTEXParseDotCorpus'))
            .pipe(ezs.catch()) // catch errors in chunks and throw a error, which breaking the pipeline
            .on('error', (e) => {
                assert(e instanceof Error);
                assert(e.message.includes('Empty content'));
                done();
            })
            .on('end', () => {
                done(new Error('Error is the right behavior'));
            });
    });
});
