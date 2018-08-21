const assert = require('assert');
const from = require('from');
const fs = require('fs');
const path = require('path');
const ezs = require('ezs');
const token = process.env.ISTEX_TOKEN;
ezs.use(require('../lib'));
ezs.use(require('ezs-basics'));
if (token) {
    console.warn('Using ISTEX_TOKEN', token);
}
describe('test', () => {
    it('ISTEXSave #0', (done) => {
        const result = [];
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
                sid: 'test',
                token
            }))
            .pipe(ezs('ISTEXSave', {
                sid: 'test',
                token,
            }))
            .pipe(ezs.catch(e => done()))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 2);
                assert(result[0].includes('QHD-T00H6VNF-0'));
                done();
            });
    }).timeout(5000);

    it('ISTEXParseDotCorpus #0', (done) => {
        const result = [];
        const corpus = fs.readFileSync(path.resolve(__dirname, './1notice.corpus'));
        from([
            corpus.toString(),
        ])
            .pipe(ezs('ISTEXParseDotCorpus'))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 1);
                assert(result[0]);
                assert.equal(result[0].publisher, 'CNRS');
                assert.equal(result[0].id, '2FF3F5B1477986B9C617BB75CA3333DBEE99EB05');
                done();
            });
    }).timeout(5000);

    it('ISTEX #0', (done) => {
        const result = [];
        from([1, 2])
            .pipe(ezs('ISTEX', {
                query: 'this is an test',
                size: 3,
                maxPage: 1,
                sid: 'test',
            }))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 6);
                assert(result[0]);
                assert.equal(result[0].id, result[3].id);
                done();
            });
    }).timeout(5000);

    it('ISTEX #1', (done) => {
        const result = [];
        from([1, 2])
            .pipe(ezs('ISTEX', {
                id: '87699D0C20258C18259DED2A5E63B9A50F3B3363',
                size: 3,
                maxPage: 1,
                sid: 'test',
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
    }).timeout(5000);

    it('ISTEX #2', (done) => {
        const result = [];
        from([1, 2])
            .pipe(ezs('ISTEX', {
                query: 'this is an test',
                id: '87699D0C20258C18259DED2A5E63B9A50F3B3363',
                size: 3,
                maxPage: 1,
                sid: 'test',
            }))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 8);
                assert(result[0]);
                assert.equal(result[0].id, result[4].id);
                done();
            });
    }).timeout(5000);

    it('ISTEXFetch #0', (done) => {
        const result = [];
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
                sid: 'test',
            }))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 2);
                assert(result[0]);
                assert.equal(result[0].id, '87699D0C20258C18259DED2A5E63B9A50F3B3363');
                assert.equal(result[1].ark[0], 'ark:/67375/QHD-T00H6VNF-0');
                done();
            });
    }).timeout(5000);

    it('ISTEXFetch #1', (done) => {
        const result = [];
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
                sid: 'test',
            }))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 2);
                assert(result[0]);
                assert.equal(result[0].id, '87699D0C20258C18259DED2A5E63B9A50F3B3363');
                assert(result[1] instanceof Error);
                done();
            });
    }).timeout(5000);

    it('ISTEXSearch #0', (done) => {
        const result = [];
        from([
            {
                _id: 1,
            },
        ])
            .pipe(ezs('ISTEXSearch', {
                query: 'this is an test',
                maxPage: 3,
                target: 'value',
                sid: 'test',
            }))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 3);
                assert(result[0]);
                assert(typeof result[0].value === 'object');
                assert(typeof result[1].value === 'string');
                done();
            });
    }).timeout(5000);

    it('ISTEXSearch #1', (done) => {
        const result = [];
        from([
            'this is an test',
        ])
            .pipe(ezs('ISTEXSearch', {
                maxPage: 3,
                sid: 'test',
            }))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 3);
                assert(result[0]);
                assert(typeof result[0] === 'object');
                assert(typeof result[1] === 'string');
                done();
            });
    }).timeout(5000);

    it('ISTEXSearch #2', (done) => {
        const result = [];
        from([
            {
                q: 'this is an test',
            },
        ])
            .pipe(ezs('ISTEXSearch', {
                source: 'q',
                maxPage: 3,
                sid: 'test',
            }))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 3);
                assert(result[0]);
                assert(typeof result[0] === 'object');
                assert(typeof result[1] === 'string');
                done();
            });
    }).timeout(5000);

    it('ISTEXSearch #3', (done) => {
        const result = [];
        from([
            'this is an test',
        ])
            .pipe(ezs('ISTEXSearch', {
                target: 'istex',
                maxPage: 3,
                sid: 'test',
            }))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 3);
                assert(result[0]);
                assert(typeof result[0].istex === 'object');
                assert(typeof result[1].istex === 'string');
                done();
            });
    }).timeout(5000);

    it('ISTEXScroll #1', (done) => {
        const result = [];
        from([
            'this is an test',
        ])
            .pipe(ezs('ISTEXSearch', {
                maxPage: 2,
                sid: 'test',
            }))
            .pipe(ezs('ISTEXScroll'))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 2);
                assert(typeof result[0] === 'object');
                assert(typeof result[1] === 'object');
                done();
            });
    }).timeout(5000);

    it('ISTEXScroll #2', (done) => {
        const result = [];
        from([
            'this is an test',
        ])
            .pipe(ezs('ISTEXSearch', {
                target: 'istex',
                maxPage: 2,
                sid: 'test',
            }))
            .pipe(ezs('ISTEXScroll', {
                source: 'istex',
                target: 'istex',
                sid: 'test',
            }))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 2);
                assert(typeof result[0].istex === 'object');
                assert(typeof result[1].istex === 'object');
                done();
            });
    }).timeout(5000);

    it('ISTEXResult #1', (done) => {
        const result = [];
        from([
            'this is an test',
        ])
            .pipe(ezs('ISTEXSearch', {
                maxPage: 2,
                sid: 'test',
            }))
            .pipe(ezs('ISTEXScroll'))
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
    }).timeout(5000);

    it('ISTEXResult #2', (done) => {
        const result = [];
        from([
            {
                mark: 'azerty',
                istex: 'this is an test',
            },
        ])
            .pipe(ezs('ISTEXSearch', {
                source: 'istex',
                target: 'istex',
                maxPage: 2,
                sid: 'test',
            }))
            .pipe(ezs('ISTEXScroll', {
                source: 'istex',
                target: 'istex',
                sid: 'test',
            }))
            .pipe(ezs('ISTEXResult', {
                source: 'istex',
                target: 'istex',
                sid: 'test',
            }))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 4000);
                assert.equal(result[0].mark, 'azerty');
                assert.equal(result[0].istex.id.length, 40);
                assert.equal(result[1000].istex.id.length, 40);
                assert.equal(result[3500].istex.id.length, 40);
                done();
            });
    }).timeout(5000);

    it.only('ISTEXTriplify #1', done => {
        const result = [];
        from([
            {
                istex: 'ezs',
            }
        ])
        .pipe(ezs('ISTEXSearch', {
            source: 'istex',
            target: 'istex',
            maxPage: 1,
            sid: 'test',
        }))
        .pipe(ezs('ISTEXScroll', {
            source: 'istex',
            target: 'istex',
            sid: 'test',
        }))
        .pipe(ezs('ISTEXResult', {
            source: 'istex',
            target: 'istex',
            sid: 'test',
        }))
        .pipe(ezs('OBJFlatten'))
        .pipe(ezs('ISTEXTriplify', {
            properties: {
                'istex/arkIstex': 'http://purl.org/dc/terms/identifier',
            }
        }))
        .on('data', chunk => {
            result.push(chunk);
        })
        .on('end', () => {
            assert(result.length > 2);
            assert.equal(result.length, 6000);
            assert(result[0].length > 0);
            assert.equal(result[0].split(' ').length, 4);
            assert(result[1].endsWith('> a <http://purl.org/ontology/bibo/Document> .\n'));
            assert(result[2].includes(' <http://purl.org/dc/terms/identifier> '));
            done();
        });
    }).timeout(5000);
});
