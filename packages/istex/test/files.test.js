import assert from 'assert';
import from from 'from';
import nock from 'nock';

import ezs from '../../core/src';
import istexFetchData from './data/istexFetch.json';

const sid = 'test';
const token = process.env.ISTEX_TOKEN;
const istexApiUrl = 'https://api.istex.fr';
const nockScope = nock(istexApiUrl)
    // .log(console.log)
    .persist();

ezs.use(require('../src'));
ezs.use(require('../../basics/src'));

if (token) {
    console.warn('Using ISTEX_TOKEN', token);
}

describe('ISTEXFiles', () => {
    it('should return files & content', (done) => {
        const result = [];
        nockScope
            .get('/document/87699D0C20258C18259DED2A5E63B9A50F3B3363?sid=test')
            .reply(200, istexFetchData)
            .get('/ark:/67375/QHD-T00H6VNF-0/record.json?sid=test')
            .reply(200, istexFetchData)
            .get('/ark:/67375/QHD-T00H6VNF-0/record.json?sid=ezs-istex')
            .reply(200, istexFetchData)
            .get('/ark:/67375/QHD-T00H6VNF-0/enrichment.multicat?sid=ezs-istex')
            .replyWithFile(200, `${__dirname}/data/istexFiles.multicat.xml`, {
                'Content-Type': 'application/xml',
            })
            .get('/ark:/67375/QHD-T00H6VNF-0/fulltext.tei?sid=ezs-istex')
            .replyWithFile(200, `${__dirname}/data/istexFiles.fulltext.xml`, {
                'Content-Type': 'application/xml',
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
                token,
            }))
            .pipe(ezs('ISTEXFiles', {
                fulltext: 'tei',
                record: 'mods',
                enrichment: 'multicat',
            }))
            .pipe(ezs('ISTEXFilesContent', {
                sid,
                token,
            }))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert(result.length > 1);
                assert(result[0].source);
                assert(result[0].content);
                assert(result[1].source);
                assert(result[1].content);
                assert(result[2].source);
                assert(result[2].content);
                assert(result[3].source);
                assert(result[3].content);
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
            .pipe(ezs('ISTEXFiles'))
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

    it('should return error when metadata or fulltext are not defined as parameter', (done) => {
        const result = [];
        nockScope
            .get('/document/87699D0C20258C18259DED2A5E63B9A50F3B3363?sid=test')
            .reply(200, istexFetchData);

        from([
            {
                id: '87699D0C20258C18259DED2A5E63B9A50F3B3363',
            },
        ])
            .pipe(ezs('ISTEXFetch', {
                source: 'id',
                sid,
                token,
            }))
            .pipe(ezs('ISTEXFiles', {
                fulltext: [],
                metadata: [],
            }))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 1);
                assert(result[0] instanceof Error);
                assert(result[0].message.includes('metadata or fulltext must be defined as parameter'));
                done();
            });
    });
});
