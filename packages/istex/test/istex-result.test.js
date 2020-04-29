import assert from 'assert';
import from from 'from';
import nock from 'nock';

import ezs from '../../core/src';
import istexResultData from './data/istexResult.json';

const sid = 'test';
const token = process.env.ISTEX_TOKEN;
const istexApiUrl = 'https://api.istex.fr';
const nockScope = nock(istexApiUrl)
    // .log(console.log)
    .persist(false);

ezs.use(require('../src'));
ezs.use(require('../../basics/src'));

if (token) {
    console.warn('Using ISTEX_TOKEN', token);
}

describe('ISTEXResult', () => {
    it('should concatenate results', (done) => {
        const result = [];
        nockScope
            .get('/document/?q=this%20is%20an%20test&scroll=5m&output=arkIstex%2Cdoi&size=2000&sid=test')
            .reply(200, istexResultData[0])
            .get(istexResultData[0].nextScrollURI.slice(istexApiUrl.length))
            .reply(200, istexResultData[1])
            .get(istexResultData[1].nextScrollURI.slice(istexApiUrl.length))
            .reply(200, istexResultData[2]);

        from([{ query: 'this is an test' }])
            .pipe(ezs('ISTEXScroll', {
                maxPage: 2,
                sid,
            }))
            .pipe(ezs('ISTEXResult'))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 4000);
                assert.equal(result[0].id.length, 40);
                assert.equal(result[1000].id.length, 40);
                assert.equal(result[3500].id.length, 40);
                done();
            });
    });

    it('should inject lodex.uri field in every hit', (done) => {
        const result = [];
        nockScope
            .get('/document/?q=this%20is%20an%20test&scroll=5m&output=arkIstex%2Cdoi&size=2000&sid=test')
            .reply(200, istexResultData[0])
            .get(istexResultData[0].nextScrollURI.slice(istexApiUrl.length))
            .reply(200, istexResultData[1]);

        from([{ query: 'this is an test', lodex: { uri: 'https://uri' } }])
            .pipe(ezs('ISTEXScroll', {
                maxPage: 1,
                sid,
            }))
            .pipe(ezs('ISTEXResult'))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 2000);
                assert.equal(result[0].id.length, 40);
                assert.ok(result[0].score);
                assert.ok(result[0].arkIstex);
                assert.ok(result[0].uri);
                done();
            });
    });
});
