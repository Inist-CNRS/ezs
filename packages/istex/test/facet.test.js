import assert from 'assert';
import from from 'from';
import nock from 'nock';

import ezs from '../../core/src';
import istexFacetData from './data/istexFacet.json';

const sid = 'test';
const istexApiUrl = 'https://api.istex.fr';
const nockScope = nock(istexApiUrl)
    // .log(console.log)
    .persist(false);

ezs.use(require('../src'));
ezs.use(require('../../basics/src'));

describe('ISTEXFacet', () => {
    it('should return aggregations', (done) => {
        const result = [];
        nockScope
            .get('/document/?q=ezs&facet=publicationDate%5BperYear%5D&size=0&sid=test')
            .reply(200, istexFacetData);

        from([{ query: 'ezs', facet: 'publicationDate[perYear]' }])
            .pipe(ezs('ISTEXFacet', {
                sid,
            }))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 1);
                assert(result[0]);
                assert(result[0].total);
                assert(result[0].aggregations);
                assert(result[0].aggregations.publicationDate);
                assert(result[0].aggregations.publicationDate.keyCount);
                assert(result[0].aggregations.publicationDate.keyCount > 0);
                assert(result[0].aggregations.publicationDate.buckets);
                assert(result[0].aggregations.publicationDate.buckets.length > 0);
                done();
            });
    });

    it('should return error with no result', (done) => {
        const result = [];
        nockScope
            .get('/document/?q=_&facet=publicationDate[perYear]&size=0&sid=test')
            .reply(200, {
                total: 0,
                hits: [],
                aggregations: {
                    publicationDate: {
                        buckets: [],
                        keyCount: 0,
                    },
                },
            });

        from([{ query: '_', facet: 'publicationDate[perYear]' }])
            .pipe(ezs('ISTEXFacet', {
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
            .get('/document/?q=__&facet=publicationDate[perYear]&size=0&sid=test')
            .reply(200, {
                hits: [],
                aggregations: {
                    publicationDate: {
                        buckets: [],
                        keyCount: 0,
                    },
                },
            });

        from([{ query: '__', facet: 'publicationDate[perYear]' }])
            .pipe(ezs('ISTEXFacet', {
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
            .get('/document/?q={}&facet=publicationDate[perYear]&size=0&sid=test')
            .reply(400, {
                _error: 'Syntaxe de la requête incorrecte sur : undefined',
            });

        from([{ query: '{}', facet: 'publicationDate[perYear]' }])
            .pipe(ezs('ISTEXFacet', {
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
