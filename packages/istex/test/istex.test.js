import assert from 'assert';
import from from 'from';
import nock from 'nock';

import ezs from '../../core/src';
import istexFetchData from './data/istexFetch.json';
import istexData from './data/istex.json';

const sid = 'test';
const istexApiUrl = 'https://api.istex.fr';
const nockScope = nock(istexApiUrl)
    // .log(console.log)
    .persist();

ezs.use(require('../src'));
ezs.use(require('../../basics/src'));

afterAll(() => nockScope.persist(false));

describe('ISTEX', () => {
    it('should apply query once per input', (done) => {
        const result = [];
        nockScope
            .get('/document/?q=this%20is%20an%20test&scroll=5m&output=arkIstex%2Cdoi&size=3&sid=test')
            .reply(200, istexData[0])
            .get(istexData[0].nextScrollURI.slice(istexApiUrl.length))
            .reply(200, istexData[1]);

        from([1, 2])
            .pipe(ezs('ISTEX', {
                query: 'this is an test',
                size: 3,
                maxPage: 1,
                sid,
            }))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                //                assert.equal(result.length, 8);
                //  result change is 6 or 8 but why ?
                assert(result[0]);
                assert.equal(result[0].id, result[3].id);
                done();
            });
    });

    it('should get identified docs once per input', (done) => {
        const result = [];
        nockScope
            .get('/document/87699D0C20258C18259DED2A5E63B9A50F3B3363?sid=test')
            .reply(200, istexFetchData);

        from([1, 2])
            .pipe(ezs('ISTEX', {
                id: '87699D0C20258C18259DED2A5E63B9A50F3B3363',
                size: 3,
                maxPage: 1,
                sid,
            }))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 2);
                assert(result[0]);
                assert.equal(result[0].id, result[1].id);
                done();
            });
    });

    it('should apply query & id once per input', (done) => {
        const result = [];
        nockScope
            .get('/document/?q=this%20is%20an%20test&scroll=5m&output=arkIstex%2Cdoi&size=3&sid=test')
            .reply(200, istexData[0])
            .get(istexData[0].nextScrollURI.slice(istexApiUrl.length))
            .reply(200, istexData[1])
            .get('/document/87699D0C20258C18259DED2A5E63B9A50F3B3363?sid=test')
            .reply(200, istexFetchData);

        from([1, 2])
            .pipe(ezs('ISTEX', {
                query: 'this is an test',
                id: '87699D0C20258C18259DED2A5E63B9A50F3B3363',
                size: 3,
                maxPage: 1,
                sid,
            }))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                // assert.equal(result.length, 8);
                assert(result[0]);
                done();
            });
    });

    it('should apply query and return error when fetch rejects', (done) => {
        nockScope
            .get('/document/?q=reject%20test&scroll=5m&output=arkIstex%2Cdoi&size=3&sid=test')
            .replyWithError({
                message: 'failed with FetchError',
                code: 404,
            });

        from([1])
            .pipe(ezs('ISTEX', {
                query: 'reject test',
                size: 3,
                maxPage: 1,
                sid,
            }))
            // .pipe(ezs('debug'))
            .pipe(ezs.catch())
            .on('error', (e) => {
                assert(e instanceof Error);
                assert(e.message.includes('failed with FetchError'));
                done();
            });
    });

    it.skip('should return error when fetching identified docs rejects', (done) => {
        nockScope
            .get('/document/87699D0C20258C18259DED2A5E63B9A50F3B3666?sid=test')
            .replyWithError({
                message: 'failed with FetchError',
                code: 404,
            });

        from([1])
            .pipe(ezs('ISTEX', {
                id: '87699D0C20258C18259DED2A5E63B9A50F3B3666',
                size: 3,
                maxPage: 1,
                sid,
            }))
            // .pipe(ezs('debug'))
            .pipe(ezs.catch())
            .on('error', (e) => {
                assert(e instanceof Error);
                assert(e.message.includes('failed with FetchError'));
                done();
            });
    });
});
