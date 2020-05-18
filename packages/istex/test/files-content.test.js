import assert from 'assert';
import from from 'from';
import nock from 'nock';

import ezs from '../../core/src';

const sid = 'test';
const token = process.env.ISTEX_TOKEN || 'TEST_ISTEX_TOKEN';
const istexApiUrl = 'https://api.istex.fr';
const nockScope = nock(istexApiUrl)
    // .log(console.log)
    .persist(false);

ezs.use(require('../src'));
ezs.use(require('../../basics/src'));

if (token) {
    console.warn('Using ISTEX_TOKEN', token);
}

describe('ISTEXFilesContent', () => {
    it('should throw an error when no source is given', (done) => {
        from([{}])
            .pipe(ezs('ISTEXFilesContent', { sid, token }))
            .on('error', (e) => {
                assert(e instanceof Error);
                assert(e.message.includes('[ISTEXFiles] should be used before this statement'));
                done();
            });
    });

    it('should return an empty stream when source is non-existing', (done) => {
        nockScope
            .get('/document/87699D0C2000000000000000000000000F3B3363?sid=test')
            .reply(404, {
                id: '87699D0C2000000000000000000000000F3B3363',
                _error: "Ce document n'existe pas.",
            });

        from([{ source: 'https://api.istex.fr/document/87699D0C2000000000000000000000000F3B3363?sid=test' }])
            .pipe(ezs('ISTEXFilesContent', { sid, token }))
            .on('error', (e) => {
                assert(e instanceof Error);
                assert(e.message.includes('Non-existing file'));
                done();
            });
    });

    it('should return file\'s content when api token is set', (done) => {
        const result = [];
        nockScope
            .get('/ark:/67375/QHD-T00H6VNF-0/fulltext.tei?sid=ezs-istex')
            .matchHeader('Authorization', `Bearer ${token}`)
            .replyWithFile(200, `${__dirname}/data/istexFiles.fulltext.xml`, {
                'Content-Type': 'application/xml',
            });

        from([{ source: 'https://api.istex.fr/ark:/67375/QHD-T00H6VNF-0/fulltext.tei?sid=ezs-istex' }])
            .pipe(ezs('ISTEXFilesContent', {
                sid,
                token,
            }))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 1);
                assert(result[0].source);
                assert(result[0].content);
                done();
            });
    });

    it('should return api access error when token is not set', (done) => {
        nockScope
            .get('/ark:/67375/QHD-T00H6VNF-0/fulltext.tei?sid=ezs-istex')
            .replyWithError({
                message: 'Unauthorized access',
                code: 403,
            });

        from([{ source: 'https://api.istex.fr/ark:/67375/QHD-T00H6VNF-0/fulltext.tei?sid=ezs-istex' }])
            .pipe(ezs('ISTEXFilesContent', {
                sid,
                // token,
            }))
            // .pipe(ezs('debug'))
            .pipe(ezs.catch())
            .on('error', (e) => {
                assert(e instanceof Error);
                assert(e.message.includes('[ISTEXFilesContent] failed with FetchError'));
                done();
            });
    });
});
