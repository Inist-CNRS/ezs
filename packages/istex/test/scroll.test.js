import assert from 'assert';
import from from 'from';
import nock from 'nock';

import ezs from '../../core/src';
import istexScrollData from './data/istexScroll.json';

const sid = 'test';
const istexApiUrl = 'https://api.istex.fr';
const nockScope = nock(istexApiUrl)
    // .log(console.log)
    .persist(false);

ezs.use(require('../src'));
ezs.use(require('../../basics/src'));

describe('ISTEXScroll', () => {
    it('should respect maxPage', (done) => {
        const result = [];
        nockScope
            .get('/document/?q=this%20is%20a%20test&scroll=5m&output=arkIstex%2Cdoi&size=1&sid=test')
            .reply(200, istexScrollData[0])
            .get(istexScrollData[0].nextScrollURI.slice(istexApiUrl.length))
            .reply(200, istexScrollData[1])
            .get(istexScrollData[1].nextScrollURI.slice(istexApiUrl.length))
            .reply(200, istexScrollData[2]);

        from([{ query: 'this is a test' }])
            .pipe(ezs('ISTEXScroll', {
                maxPage: 2,
                size: 1,
                sid,
            }))
        // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 2);
                assert.equal(typeof result[0], 'object');
                assert.equal(typeof result[1], 'object');
                done();
            });
    });

    it('should execute queries from input', (done) => {
        const result = [];
        nockScope
            .get('/document/?q=ezs&scroll=5m&output=arkIstex%2Cdoi&size=1&sid=test')
            .reply(200, istexScrollData[3])
            .get(istexScrollData[3].nextScrollURI.slice(istexApiUrl.length))
            .reply(200, istexScrollData[4])
            .get('/document/?q=test&scroll=5m&output=arkIstex%2Cdoi&size=1&sid=test')
            .reply(200, istexScrollData[5])
            .get(istexScrollData[5].nextScrollURI.slice(istexApiUrl.length))
            .reply(200, istexScrollData[6]);

        from([{ query: 'ezs' }, { query: 'test' }])
            .pipe(ezs('ISTEXScroll', {
                maxPage: 1,
                size: 1,
                sid,
            }))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 2);
                assert.equal(typeof result[0], 'object');
                assert.equal(typeof result[1], 'object');
                assert.notDeepEqual(result[0], result[1]);
                done();
            });
    });

    it('should reply even only one result', (done) => {
        const result = [];
        nockScope
            .get('/document/?q=language.raw%3Arum&scroll=5m&output=arkIstex%2Cdoi&size=2000&sid=test')
            .reply(200, istexScrollData[7]);

        from([{ query: 'language.raw:rum' }])
            .pipe(ezs('ISTEXScroll', {
                sid,
            }))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 1);
                assert.equal(typeof result[0], 'object');
                done();
            });
    });

    it('should go through the right number of pages', (done) => {
        const result = [];
        nockScope
            .get('/document/?q=ezs&scroll=5m&output=arkIstex%2Cdoi&size=2000&sid=test')
            .reply(200, istexScrollData[8])
            .get(istexScrollData[8].nextScrollURI.slice(istexApiUrl.length))
            .reply(200, istexScrollData[9]);

        // ezs returns 2471 results (2018/11/16)
        // ezs returns 2691 results (2020/04/16)
        from([{ query: 'ezs' }])
            .pipe(ezs('ISTEXScroll', {
                sid,
                size: 2000,
            }))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 2);
                done();
            });
    });

    it('should merge initial object and response in first object', (done) => {
        const result = [];
        nockScope
            .get('/document/?q=language.raw%3Arum&scroll=5m&output=arkIstex%2Cdoi&size=2000&sid=test')
            .reply(200, istexScrollData[10]);

        from([{
            lodex: {
                uri: 'https://api.istex.fr/ark',
            },
            query: 'language.raw:rum',
        }])
            .pipe(ezs('ISTEXScroll', {
                sid,
            }))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 1);
                assert.equal(typeof result[0], 'object');
                assert.equal(result[0].query, 'language.raw:rum');
                assert.ok(result[0].lodex);
                assert.equal(result[0].lodex.uri, 'https://api.istex.fr/ark');
                done();
            });
    });

    it('should merge initial object and response in second object', (done) => {
        const result = [];
        nockScope
            .get('/document/?q=ezs&scroll=5m&output=arkIstex%2Cdoi&size=2000&sid=test')
            .reply(200, istexScrollData[8])
            .get(istexScrollData[8].nextScrollURI.slice(istexApiUrl.length))
            .reply(200, istexScrollData[9]);

        from([{
            lodex: {
                uri: 'https://api.istex.fr/ark',
            },
            query: 'ezs',
        }])
            .pipe(ezs('ISTEXScroll', {
                sid,
                size: 2000,
            }))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 2);
                assert.equal(typeof result[1], 'object');
                assert.equal(result[1].query, 'ezs');
                assert.ok(result[1].lodex);
                assert.equal(result[1].lodex.uri, 'https://api.istex.fr/ark');
                done();
            });
    });


    it('should return error with no result', (done) => {
        const result = [];
        nockScope
            .get('/document/?q=_&scroll=5m&output=arkIstex%2Cdoi&size=2000&sid=test')
            .reply(200, {
                total: 0,
                hits: [],
            });

        from([{ query: '_' }])
            .pipe(ezs('ISTEXScroll', {
                sid,
            }))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 1);
                assert(result[0] instanceof Error);
                assert(result[0].message.includes('No result'));
                done();
            });
    });

    it('should return error with unexpected response', (done) => {
        const result = [];
        nockScope
            .get('/document/?q=__&scroll=5m&output=arkIstex%2Cdoi&size=2000&sid=test')
            .reply(200, {
                hits: [],
            });

        from([{ query: '__' }])
            .pipe(ezs('ISTEXScroll', {
                sid,
            }))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 1);
                assert(result[0] instanceof Error);
                assert(result[0].message.includes('Unexpected response'));
                done();
            });
    });

    it('should return error with _error', (done) => {
        const result = [];
        nockScope
            .get('/document/?q={}&scroll=5m&output=arkIstex%2Cdoi&size=2000&sid=test')
            .reply(400, {
                _error: 'Syntaxe de la requête incorrecte sur : undefined',
            });

        from([{ query: '{}' }])
            .pipe(ezs('ISTEXScroll', {
                sid,
            }))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 1);
                assert(result[0] instanceof Error);
                assert(result[0].message.includes('Syntaxe de la requête incorrecte'));
                done();
            });
    });
});
