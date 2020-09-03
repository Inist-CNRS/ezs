import assert from 'assert';
import from from 'from';
import nock from 'nock';

import ezs from '../../core/src';
import istexFetchData from './data/istexFetch.json';

const sid = 'test';
const istexApiUrl = 'https://api.istex.fr';
const nockScope = nock(istexApiUrl)
    // .log(console.log)
    .persist(false);

ezs.use(require('../src'));
ezs.use(require('../../basics/src'));

describe('ISTEXFetch', () => {
    it('should get the right metadata', (done) => {
        const result = [];
        nockScope
            .get('/document/87699D0C20258C18259DED2A5E63B9A50F3B3363?sid=test')
            .reply(200, istexFetchData)
            .get('/ark:/67375/QHD-T00H6VNF-0/record.json?sid=test')
            .reply(200, istexFetchData);

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
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 2);
                assert(result[0]);
                assert.equal(result[0].id,
                    '87699D0C20258C18259DED2A5E63B9A50F3B3363');
                assert.equal(result[1].ark[0], 'ark:/67375/QHD-T00H6VNF-0');
                done();
            });
    });

    it('should return an error when the ID does not exist', (done) => {
        const result = [];
        nockScope
            .get('/document/87699D0C20258C18259DED2A5E63B9A50F3B3363?sid=test')
            .reply(200, istexFetchData)
            .get('/ark:/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx/record.json?sid=test')
            .replyWithError({
                message: 'L\'identifiant ARK saisi n\'a pas le format requis.',
                code: 400,
            });

        from([
            {
                id: '87699D0C20258C18259DED2A5E63B9A50F3B3363',
            },
            {
                id: 'ark:/xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx',
            },
        ])
            .pipe(ezs('ISTEXFetch', {
                source: 'id',
                sid,
            }))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 2);
                assert(result[0]);
                assert.equal(result[0].id,
                    '87699D0C20258C18259DED2A5E63B9A50F3B3363');
                assert(result[1] instanceof Error);
                assert(result[1].message.includes('L\'identifiant ARK saisi n\'a pas le format requis'));
                done();
            });
    });

    it('should return an error with Unexpected id', (done) => {
        const result = [];
        nockScope
            .get('/document/87699D0C20258C18259DED2A5E63B9A50F3B336?sid=test')
            .replyWithError({
                message: 'Unexpected id.',
                code: 400,
            })
            .get('/foo/ark:/xxxxxxxxxxxxxxxxxxxxxxx/?sid=test')
            .replyWithError({
                message: 'Unexpected id.',
                code: 400,
            });

        from([
            {
                id: '87699D0C20258C18259DED2A5E63B9A50F3B336',
            },
            {
                id: 'foo/ark:/xxxxxxxxxxxxxxxxxxxxxxx',
            },
        ])
            .pipe(ezs('ISTEXFetch', {
                source: 'id',
                sid,
            }))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 2);
                assert(result[0] instanceof Error);
                assert(result[0].message.includes('Unexpected id'));
                assert(result[1] instanceof Error);
                assert(result[1].message.includes('Unexpected id'));
                done();
            });
    });

    it('should return error when fetch throws json._error', (done) => {
        const result = [];
        nockScope
            .get('/document/87699D0C20258C18259DED2A5E63B9A50F3B3363?sid=test')
            .reply(400, {
                _error: 'error message',
            })
            .get('/ark:/67375/QHD-T00H6VNF-0/record.json?sid=test')
            .reply(400, {
                _error: 'error message',
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
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 2);
                assert(result[0] instanceof Error);
                assert(result[0].message.includes('error message'));
                assert(result[1] instanceof Error);
                assert(result[1].message.includes('error message'));
                done();
            });
    });
});
