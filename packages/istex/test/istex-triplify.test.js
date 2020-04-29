import assert from 'assert';
import from from 'from';
import nock from 'nock';

import ezs from '../../core/src';
import istexScrollData from './data/istexScroll.json';
import istexTriplifyData from './data/istexTriplify.json';


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

describe('ISTEXTriplify', () => {
    it('should return triples, rdfs:type and identifier', (done) => {
        const result = [];
        nockScope
            .get('/document/?q=ezs&scroll=5m&output=arkIstex%2Cdoi&size=2000&sid=test')
            .reply(200, istexScrollData[8])
            .get(istexScrollData[8].nextScrollURI.slice(istexApiUrl.length))
            .reply(200, istexScrollData[9]);

        from([{ query: 'ezs' }])
            .pipe(ezs('ISTEXScroll', {
                maxPage: 1,
                sid,
            }))
            .pipe(ezs('ISTEXResult', {
                sid,
            }))
            .pipe(ezs('OBJFlatten'))
            .pipe(ezs('ISTEXTriplify', {
                property: [
                    'arkIstex -> http://purl.org/dc/terms/identifier',
                ],
            }))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert(result.length > 2);
                assert(result[0].length > 0);
                assert.equal(result[0].split(' ').length, 4);
                assert(result[1].endsWith('> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://purl.org/ontology/bibo/Document> .\n'));
                assert(result[2].includes(' <http://purl.org/dc/terms/identifier> '));
                done();
            });
    });

    it('should not return triples containing undefined', (done) => {
        const result = [];
        nockScope
            .get('/document/?q=ezs&scroll=5m&output=arkIstex%2Cauthor&size=2000&sid=test')
            .reply(200, istexTriplifyData[0])
            .get(istexTriplifyData[0].nextScrollURI.slice(istexApiUrl.length))
            .reply(200, istexTriplifyData[1]);

        from([{ query: 'ezs' }])
            .pipe(ezs('ISTEXScroll', {
                maxPage: 1,
                sid,
                field: 'author',
            }))
            .pipe(ezs('ISTEXResult', {
                sid,
            }))
            .pipe(ezs('OBJFlatten', { safe: false }))
            .pipe(ezs('ISTEXTriplify', {
                property: [
                    'author/\\d+/name -> http://purl.org/dc/terms/creator',
                ],
            }))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert(result.length > 2);
                assert(result[0].length > 0);
                assert.equal(result[0].split(' ').length, 4);
                assert(result[1].endsWith('> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://purl.org/ontology/bibo/Document> .\n'));
                assert(result.some((t) => t.includes(' <http://purl.org/dc/terms/creator> ')));
                assert(!result.some((t) => t.includes('"undefined"')));
                done();
            });
    });

    it('should return URLs in angle brackets', (done) => {
        const result = [];
        nockScope
            .get('/document/?q=language.raw%3Arum&scroll=5m&output=arkIstex%2Cfulltext&size=2000&sid=test')
            .reply(200, istexTriplifyData[2]);

        from([{ query: 'language.raw:rum' }])
            .pipe(ezs('ISTEXScroll', {
                maxPage: 1,
                sid,
                field: 'fulltext',
            }))
            .pipe(ezs('ISTEXResult', {
                sid,
            }))
            .pipe(ezs('OBJFlatten', { safe: false }))
            .pipe(ezs('ISTEXTriplify', {
                property: [
                    'fulltext/0/uri -> https://data.istex.fr/ontology/istex#accessURL',
                ],
            }))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert(result.length > 2);
                assert(result[0].length > 0);
                assert.equal(result[0].split(' ').length, 4);
                assert(result[1].endsWith('> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <http://purl.org/ontology/bibo/Document> .\n'));
                assert(result[2].includes(' <https://data.istex.fr/ontology/istex#accessURL> '));
                assert(result[2].endsWith('> .\n'));
                assert(result[2].includes(' <https://api.istex.fr/ark:/67375/'));
                assert(!result[2].includes('undefined'));
                done();
            });
    });

    it('should begin each subject with <https://api.istex.fr/ark:/', (done) => {
        const result = [];
        nockScope
            .get('/document/?q=language.raw%3Arum&scroll=5m&output=arkIstex%2Cfulltext&size=2000&sid=test')
            .reply(200, istexTriplifyData[2]);

        from([{ query: 'language.raw:rum' }])
            .pipe(ezs('ISTEXScroll', {
                maxPage: 1,
                sid,
                field: 'fulltext',
            }))
            .pipe(ezs('ISTEXResult', {
                sid,
            }))
            .pipe(ezs('OBJFlatten', { safe: false }))
            .pipe(ezs('ISTEXTriplify', {
                property: [
                    'fulltext/0/uri -> https://data.istex.fr/ontology/istex#accessURL',
                ],
            }))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert(result.length > 2);
                assert(result[0].length > 0);
                assert.equal(result[0].split(' ').length, 4);
                assert(result[0].startsWith('<https://api.istex.fr/ark:/'));
                assert(result[1].startsWith('<https://api.istex.fr/ark:/'));
                assert(result[2].startsWith('<https://api.istex.fr/ark:/'));
                assert(!result[2].includes('undefined'));
                done();
            });
    });

    it('should not yield undefined values', (done) => {
        const result = [];
        from([
            {
                arkIstex: 'ark:/fake',
                id: '1',
                'author/3/affiliations/1': null,
                'author/3/affiliations/2': 'E-mail: ivan.couee@univ-rennes1.fr',
            },
        ])
            .pipe(ezs('ISTEXTriplify', {
                property: [
                    '^author/\\d+/affiliations -> https://data.istex.fr/ontology/istex#affiliation',
                ],
            }))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert.equal(3, result.length);
                assert(!result[2].includes('undefined'));
                assert.equal('<https://api.istex.fr/ark:/fake> <https://data.istex.fr/ontology/istex#affiliation> "E-mail: ivan.couee@univ-rennes1.fr" .\n', result[2]);
                done();
            });
    });

    it('should escape double quotes', (done) => {
        const result = [];
        from([
            {
                arkIstex: 'ark:/fake',
                id: '1',
                'author/3/affiliations/2':
                  'E-mail: "ivan.couee@univ-rennes1.fr"',
            },
        ])
            .pipe(ezs('ISTEXTriplify', {
                property: [
                    '^author/\\d+/affiliations -> https://data.istex.fr/ontology/istex#affiliation',
                ],
            }))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 3);
                assert(!result[2].includes('undefined'));
                assert.equal(result[2], '<https://api.istex.fr/ark:/fake> <https://data.istex.fr/ontology/istex#affiliation> "E-mail: \\"ivan.couee@univ-rennes1.fr\\"" .\n');
                done();
            });
    });

    it('should yield as many triples as properties', (done) => {
        const result = [];
        from([
            {
                arkIstex: 'ark:/fake',
                id: '1',
                'author/3/affiliations/2': 'E-mail: ivan.couee@univ-rennes1.fr',
            },
        ])
            .pipe(ezs('ISTEXTriplify', {
                property: [
                    '^author/\\d+/affiliations -> https://data.istex.fr/ontology/istex#affiliation',
                    '^author/\\d+/affiliations -> https://data.istex.fr/ontology/istex#fakeProperty',
                ],
            }))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert.equal(4, result.length);
                assert(!result[2].includes('undefined'));
                assert.equal('<https://api.istex.fr/ark:/fake> <https://data.istex.fr/ontology/istex#affiliation> "E-mail: ivan.couee@univ-rennes1.fr" .\n', result[2]);
                assert.equal('<https://api.istex.fr/ark:/fake> <https://data.istex.fr/ontology/istex#fakeProperty> "E-mail: ivan.couee@univ-rennes1.fr" .\n', result[3]);
                done();
            });
    });

    it('should yield matching properties', (done) => {
        const result = [];
        from([
            {
                arkIstex: 'ark:/fake',
                id: '1',
                'author/3/affiliations/2': 'E-mail: ivan.couee@univ-rennes1.fr',
            },
        ])
            .pipe(ezs('ISTEXTriplify', {
                property: '^author/\\d+/affiliations -> https://data.istex.fr/ontology/istex#affiliation',
            }))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert.equal(3, result.length);
                assert(!result[2].includes('undefined'));
                assert.equal('<https://api.istex.fr/ark:/fake> <https://data.istex.fr/ontology/istex#affiliation> "E-mail: ivan.couee@univ-rennes1.fr" .\n', result[2]);
                done();
            });
    });

    it('should not yield triples including "undefined"', (done) => {
        const result = [];
        from([
            {
                arkIstex: 'ark:/fake',
                id: '1',
                'author/3/affiliations/1': null,
                'author/3/affiliations/2': 'E-mail: ivan.couee@univ-rennes1.fr',
            },
            {},
        ])
            .pipe(ezs('ISTEXTriplify', {
                property: [
                    '^author/\\d+/name -> http://purl.org/dc/terms/creator',
                    '^author/\\d+/affiliations -> https://data.istex.fr/ontology/istex#affiliation',
                ],
            }))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert(!result.some((triple) => triple.includes('undefined')));
                done();
            });
    });
});
