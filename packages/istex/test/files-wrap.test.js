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

afterAll(() => nockScope.persist(false));

describe('ISTEXFilesWrap', () => {
    it('should wrap ISTEX stream into a single zip', (done) => {
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
            .pipe(ezs('ISTEXFilesWrap'))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert(result.length > 1);
                assert(result[0].buffer.byteLength > 0);
                // assert(fs.existsSync('zip.zip'));
                done();
            });
    });

    it('should return error when required plugin is missing', (done) => {
        from([
            {
                id: '87699D0C20258C18259DED2A5E63B9A50F3B3363',
            },
            {
                id: 'ark:/67375/QHD-T00H6VNF-0',
            },
        ])
            .pipe(ezs('ISTEXFilesWrap'))
            // .pipe(ezs('debug'))
            .pipe(ezs.catch())
            .on('error', (e) => {
                assert(e instanceof Error);
                assert(e.message.includes('[ISTEXFilesContent] should be defined before this statement'));
                done();
            });
    });
});
