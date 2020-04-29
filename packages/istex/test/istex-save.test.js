import assert from 'assert';
import from from 'from';
import fs from 'fs';
import nock from 'nock';

import ezs from '../../core/src';
import istexFetchData from './data/istexFetch.json';
import istexSaveData from './data/istexSave.json';
import istexScrollData from './data/istexScroll.json';


const sid = 'test';
const token = process.env.ISTEX_TOKEN || 'TEST_ISTEX_TOKEN';
const istexApiUrl = 'https://api.istex.fr';
const nockScope = nock(istexApiUrl)
    // .log(console.log)
    .persist();

ezs.use(require('../src'));
ezs.use(require('../../basics/src'));

if (token) {
    console.warn('Using ISTEX_TOKEN', token);
}

describe('ISTEXSave', () => {
    afterAll((done) => {
        fs.unlink('QHD-T00H6VNF-0-fulltext.pdf', done);
        fs.unlink('V84-23MC4096-8-fulltext.pdf', done);
        fs.unlink('NDQ-W42TSQDR-H-fulltext.pdf', done);
    });

    it('should get the right PDFs when using ISTEXFetch plugin', (done) => {
        const result = [];
        nockScope
            .get('/document/87699D0C20258C18259DED2A5E63B9A50F3B3363?sid=test')
            .reply(200, istexFetchData)
            .get('/ark:/67375/QHD-T00H6VNF-0/record.json?sid=test')
            .reply(200, istexFetchData)
            .get('/ark:/67375/QHD-T00H6VNF-0/fulltext.pdf?sid=test')
            .matchHeader('Authorization', `Bearer ${token}`)
            .reply(200, '/app/QHD-T00H6VNF-0-fulltext.pdf');

        from([
            {
                id: '87699D0C20258C18259DED2A5E63B9A50F3B3363',
            },
            {
                id: 'ark:/67375/QHD-T00H6VNF-0',
            },
        ])
            .pipe(ezs('ISTEXFetch', {
                source: 'id',
                sid,
            }))
            .pipe(ezs('ISTEXSave', {
                sid,
                token,
            }))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 2);
                assert(result[0].includes('QHD-T00H6VNF-0'));
                assert(result[0].endsWith('.pdf'));
                assert(result[1].includes('QHD-T00H6VNF-0'));
                assert(result[1].endsWith('.pdf'));
                done();
            });
    });

    it('should get the right PDFs when using ISTEXScroll plugin', (done) => {
        const result = [];
        nockScope
            .get('/document/?q=language.raw%3Arum&scroll=5m&output=arkIstex%2Cdoi&size=2000&sid=test')
            .reply(200, istexScrollData[7])
            .get('/ark:/67375/V84-23MC4096-8/fulltext.pdf?sid=test')
            .matchHeader('Authorization', `Bearer ${token}`)
            .reply(200, '/app/V84-23MC4096-8-fulltext.pdf')
            .get('/ark:/67375/NDQ-W42TSQDR-H/fulltext.pdf?sid=test')
            .matchHeader('Authorization', `Bearer ${token}`)
            .reply(200, '/app/NDQ-W42TSQDR-H-fulltext.pdf');

        from([{ query: 'language.raw:rum' }])
            .pipe(ezs('ISTEXScroll', {
                sid,
            }))
            // .pipe(ezs('debug'))
            .pipe(ezs('ISTEXSave', {
                sid,
                token,
            }))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 2);
                assert(result[0].includes('NDQ-W42TSQDR-H'));
                assert(result[0].endsWith('.pdf'));
                assert(result[1].includes('V84-23MC4096-8'));
                assert(result[1].endsWith('.pdf'));
                done();
            });
    });

    it('should return error when typology or format are not defined as parameter', (done) => {
        nockScope
            .get('/document/87699D0C20258C18259DED2A5E63B9A50F3B3363?sid=test')
            .reply(200, istexFetchData)
            .get('/ark:/67375/QHD-T00H6VNF-0/record.json?sid=test')
            .reply(200, istexFetchData)
            .get('/ark:/67375/QHD-T00H6VNF-0/.?sid=test')
            .reply(200, istexSaveData);

        from([
            {
                id: '87699D0C20258C18259DED2A5E63B9A50F3B3363',
            },
            {
                id: 'ark:/67375/QHD-T00H6VNF-0',
            },
        ])
            .pipe(ezs('ISTEXFetch', {
                source: 'id',
                sid,
            }))
            .pipe(ezs('ISTEXSave', {
                sid,
                token,
                typology: null,
                format: null,
            }))
            .pipe(ezs('debug'))
            .pipe(ezs.catch())
            .on('error', (e) => {
                assert(e instanceof Error);
                assert(e.message.includes('typology= & format= must be defined as parameter'));
                done();
            });
    });

    it('should return error when required plugin is missing', (done) => {
        const result = [];
        from([
            {
                id: '87699D0C20258C18259DED2A5E63B9A50F3B3363',
            },
        ])
            .pipe(ezs('ISTEXSave'))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 1);
                assert(result[0] instanceof Error);
                assert(result[0].message.includes('[ISTEXFetch] or [ISTEXScroll] should be defined before this statement'));
                done();
            });
    });

    it.skip('should return error when unexpected body response', (done) => {
        const result = [];
        nockScope
            .get('/ark:/67375/QHD-T00H6VNF-0/record.json?sid=test')
            .reply(200, istexFetchData)
            .get('/ark:/67375/QHD-T00H6VNF-0/fulltext.pdf?sid=test')
            .matchHeader('Authorization', `Bearer ${token}`)
            .reply(200, {});

        from([
            {
                id: 'ark:/67375/QHD-T00H6VNF-0',
            },
        ])
            .pipe(ezs('ISTEXFetch', {
                source: 'id',
                sid,
            }))
            .pipe(ezs('ISTEXSave', {
                sid,
                token,
            }))
            // .pipe(ezs('debug'))
            .pipe(ezs.catch())
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('error', (e) => {
                assert(e instanceof Error);
                assert(e.message.includes('[ISTEXSave] failed with Error: Unexpected response'));
                done();
            });
    });

    it.skip('should return api access error when token is not set', (done) => {
        const result = [];
        nockScope
            .get('/document/87699D0C20258C18259DED2A5E63B9A50F3B3363?sid=test')
            .reply(200, istexFetchData)
            .get('/ark:/67375/QHD-T00H6VNF-0/record.json?sid=test')
            .reply(200, istexFetchData)
            .get('/ark:/67375/QHD-T00H6VNF-0/fulltext.pdf?sid=test')
            .replyWithError({
                message: 'Unauthorized access',
                code: 403,
            });

        from([
            {
                id: '87699D0C20258C18259DED2A5E63B9A50F3B3363',
            },
            {
                id: 'ark:/67375/QHD-T00H6VNF-0',
            },
        ])
            .pipe(ezs('ISTEXFetch', {
                source: 'id',
                sid,
            }))
            .pipe(ezs('ISTEXSave', {
                sid,
                // token,
            }))
            // .pipe(ezs('debug'))
            .pipe(ezs.catch())
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('error', (e) => {
                assert(e instanceof Error);
                assert(e.message.includes('[ISTEXSave] failed with FetchError'));
                done();
            })
            .on('end', () => {
                assert.equal(result.length, 2);
                assert(result[0] instanceof Error);
                assert(result[0].message.includes('[ISTEXSave] failed with FetchError'));
                assert(result[1] instanceof Error);
                assert(result[1].message.includes('[ISTEXSave] failed with FetchError'));
                done();
            });
    });
});
