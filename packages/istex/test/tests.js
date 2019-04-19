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

describe('ISTEXSave', () => {
    it('should get the right PDFs', (done) => {
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
                token,
            }))
            .pipe(ezs('ISTEXSave', {
                sid: 'test',
                token,
            }))
            .pipe(ezs.catch(() => done()))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 2);
                assert(result[0].includes('QHD-T00H6VNF-0'));
                assert(result[0].endsWith('.pdf'));
                done();
            });
    }).timeout(5000);
});

describe('ISTEXFetch', () => {
    it('should get the right metadata', (done) => {
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
                assert.equal(result[0].id,
                    '87699D0C20258C18259DED2A5E63B9A50F3B3363');
                assert.equal(result[1].ark[0], 'ark:/67375/QHD-T00H6VNF-0');
                done();
            });
    }).timeout(5000);

    it('should return an error when the ID does not exist', (done) => {
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
                assert.equal(result[0].id,
                    '87699D0C20258C18259DED2A5E63B9A50F3B3363');
                assert(result[1] instanceof Error);
                done();
            });
    }).timeout(5000);
});

describe('ISTEXResult', () => {
    it('should concatenate results', (done) => {
        const result = [];
        from([{ query: 'this is an test' }])
            .pipe(ezs('ISTEXScroll', {
                maxPage: 2,
                sid: 'test',
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
    }).timeout(10000);

    it('should inject lodex.uri field in every hit', (done) => {
        const result = [];
        from([{ query: 'this is an test', lodex: { uri: 'https://uri' } }])
            .pipe(ezs('ISTEXScroll', {
                maxPage: 1,
                sid: 'test',
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
    }).timeout(10000);
});

describe('ISTEXTriplify', () => {
    it('should return triples, rdfs:type and identifier', (done) => {
        const result = [];
        from([{ query: 'ezs' }])
            .pipe(ezs('ISTEXScroll', {
                maxPage: 1,
                sid: 'test',
            }))
            .pipe(ezs('ISTEXResult', {
                sid: 'test',
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
    }).timeout(10000);

    it('should not return triples containing undefined', (done) => {
        const result = [];
        from([{ query: 'ezs' }])
            .pipe(ezs('ISTEXScroll', {
                maxPage: 1,
                sid: 'test',
                field: 'author',
            }))
            .pipe(ezs('ISTEXResult', {
                sid: 'test',
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
                assert(result.some(t => t.includes(' <http://purl.org/dc/terms/creator> ')));
                assert(!result.some(t => t.includes('"undefined"')));
                done();
            });
    }).timeout(10000);

    it('should return URLs in angle brackets', (done) => {
        const result = [];
        from([{ query: 'language.raw:rum' }])
            .pipe(ezs('ISTEXScroll', {
                maxPage: 1,
                sid: 'test',
                field: 'fulltext',
            }))
            .pipe(ezs('ISTEXResult', {
                sid: 'test',
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
    }).timeout(5000);

    it('should begin each subject with <https://api.istex.fr/ark:/', (done) => {
        const result = [];
        from([{ query: 'language.raw:rum' }])
            .pipe(ezs('ISTEXScroll', {
                maxPage: 1,
                sid: 'test',
                field: 'fulltext',
            }))
            .pipe(ezs('ISTEXResult', {
                sid: 'test',
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
    }).timeout(5000);

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
    }).timeout(5000);

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
    }).timeout(5000);

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
    }).timeout(5000);

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
    }).timeout(5000);

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
                assert(!result.some(triple => triple.includes('undefined')));
                done();
            });
    }).timeout(5000);
});

describe('ISTEX', () => {
    it('should apply query once per input', (done) => {
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
    }).timeout(10000);

    it('should get identified docs once per input', (done) => {
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

    it('should apply query & id once per input', (done) => {
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
    }).timeout(12000);
});

describe('ISTEXUniq', () => {
    it('should remove identical lines one after another', (done) => {
        let result = [];
        from([
            '<subject> <verb> <complement> .',
            '<subject> <verb> <complement> .',
        ])
            .pipe(ezs('ISTEXUniq'))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                result = result.concat(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 1);
                assert.equal(result[0], '<subject> <verb> <complement> .\n');
                done();
            });
    });

    it('should remove identical lines even if not following one another',
        (done) => {
            let result = [];
            from([
                '<subject> <verb> <complement> .',
                '<subject> <verb2> <complement2> .',
                '<subject> <verb> <complement> .',
            ])
                .pipe(ezs('ISTEXUniq'))
                // .pipe(ezs('debug'))
                .on('data', (chunk) => {
                    result = result.concat(chunk);
                })
                .on('end', () => {
                    assert.equal(result.length, 2);
                    assert.equal(result[0],
                        '<subject> <verb> <complement> .\n');
                    assert.equal(result[1],
                        '<subject> <verb2> <complement2> .\n');
                    done();
                });
        });

    it('should remove identical lines in two different subjects', (done) => {
        let result = [];
        from([
            '<subject1> <verb> <complement> .',
            '<subject1> <verb2> <complement2> .',
            '<subject1> <verb> <complement> .',
            '<subject2> <verb> <complement> .',
            '<subject2> <verb2> <complement2> .',
            '<subject2> <verb> <complement> .',
        ])
            .pipe(ezs('ISTEXUniq'))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                result = result.concat(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 4);
                assert.equal(result[0], '<subject1> <verb> <complement> .\n');
                assert.equal(result[1], '<subject1> <verb2> <complement2> .\n');
                assert.equal(result[2], '<subject2> <verb> <complement> .\n');
                assert.equal(result[3], '<subject2> <verb2> <complement2> .\n');
                done();
            });
    });

    it(
        'should remove identical lines in two different subjects '
        + 'when verbs are different',
        (done) => {
            let result = [];
            from([
                '<subject1> <verb> <complement> .',
                '<subject1> <verb2> <complement2> .',
                '<subject1> <verb> <complement> .',
                '<subject2> <verb2> <complement> .',
                '<subject2> <verb> <complement2> .',
                '<subject2> <verb2> <complement> .',
            ])
                .pipe(ezs('ISTEXUniq'))
                // .pipe(ezs('debug'))
                .on('data', (chunk) => {
                    result = result.concat(chunk);
                })
                .on('end', () => {
                    assert.equal(result.length, 4);
                    assert.equal(result[0],
                        '<subject1> <verb> <complement> .\n');
                    assert.equal(result[1],
                        '<subject1> <verb2> <complement2> .\n');
                    assert.equal(result[2],
                        '<subject2> <verb2> <complement> .\n');
                    assert.equal(result[3],
                        '<subject2> <verb> <complement2> .\n');
                    done();
                });
        },
    );

    it('should not mess up > character in literal', (done) => {
        let result = [];
        from([
            '<subject1> <verb> "Another Rigvedic Genitive Singular in -E > -AS?" .',
        ])
            .pipe(ezs('ISTEXUniq'))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                result = result.concat(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 1);
                assert.equal(result[0],
                    '<subject1> <verb> "Another Rigvedic Genitive Singular in -E > -AS?" .\n');
                done();
            });
    });

    it('should not mess up \\ character in literal', (done) => {
        let result = [];
        from([
            '<subject1> <verb> "Kroi\\" .',
        ])
            .pipe(ezs('ISTEXUniq'))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                result = result.concat(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 1);
                assert.equal(result[0],
                    '<subject1> <verb> "Kroi\\\\" .\n');
                done();
            });
    });
});

describe('ISTEXParseDotCorpus', () => {
    it('should parse identifiers', (done) => {
        const result = [];
        const corpus = fs.readFileSync(path.resolve(__dirname,
            './1notice.corpus'));
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
                assert.equal(result[0].id,
                    '2FF3F5B1477986B9C617BB75CA3333DBEE99EB05');
                done();
            });
    }).timeout(5000);

    it('should parse query', (done) => {
        const result = [];
        const corpus = fs.readFileSync(path.resolve(__dirname,
            './1query.corpus'));
        from([
            corpus.toString(),
        ])
            // .pipe(ezs('debug'))
            .pipe(ezs('ISTEXParseDotCorpus'))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert(result.length > 0);
                assert(result[0]);
                assert.equal(result[0].publisher, 'CNRS');
                done();
            });
    }).timeout(5000);
});

describe('ISTEXScroll', () => {
    it('should respect maxPage', (done) => {
        const result = [];
        from([{ query: 'this is a test' }])
            .pipe(ezs('ISTEXScroll', {
                maxPage: 2,
                size: 1,
                sid: 'test',
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
    }).timeout(5000);

    it('should execute queries from input', (done) => {
        const result = [];
        from([{ query: 'ezs' }, { query: 'test' }])
            .pipe(ezs('ISTEXScroll', {
                maxPage: 1,
                size: 1,
                sid: 'test',
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
    }).timeout(5000);

    it('should reply even only one result', (done) => {
        const result = [];
        from([{ query: 'language.raw:rum' }])
            .pipe(ezs('ISTEXScroll', {
                sid: 'test',
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
        // ezs returns 2471 results (2018/11/16)
        from([{ query: 'ezs' }])
            .pipe(ezs('ISTEXScroll', { sid: 'test', size: 2000 }))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 2);
                done();
            });
    }).timeout(5000);

    it('should merge initial object and response in first object', (done) => {
        const result = [];
        from([{
            lodex: {
                uri: 'https://api.istex.fr/ark',
            },
            query: 'language.raw:rum',
        }])
            .pipe(ezs('ISTEXScroll', { sid: 'test' }))
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
        from([{
            lodex: {
                uri: 'https://api.istex.fr/ark',
            },
            query: 'ezs',
        }])
            .pipe(ezs('ISTEXScroll', { sid: 'test', size: 2000 }))
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
    }).timeout(5000);
});

describe('ISTEXUnzip', () => {
    it('should get 10 elements', (done) => {
        const result = [];
        fs.createReadStream('./examples/data/istex-subset-2019-03-15-10.zip')
            .pipe(ezs('ISTEXUnzip'))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('error', done)
            .on('end', () => {
                assert.equal(result.length, 10);
                done();
            });
    });

    it('should get JSON objects', (done) => {
        const result = [];
        fs.createReadStream('./examples/data/istex-subset-2019-03-15-10.zip')
            .pipe(ezs('ISTEXUnzip'))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('error', done)
            .on('end', () => {
                assert(result.length > 1);
                assert.equal(typeof result[0], 'object');
                done();
            });
    });

    it('should get proper first JSON object', (done) => {
        const result = [];
        fs.createReadStream('./examples/data/istex-subset-2019-03-15-10.zip')
            .pipe(ezs('ISTEXUnzip'))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('error', done)
            .on('end', () => {
                assert(result.length > 1);
                assert.equal(typeof result[0], 'object');
                assert.equal(result[0].arkIstex, 'ark:/67375/56L-Z1WPCL8D-T');
                assert.equal(result[0].title,
                    'A case of diabetes, with an historical sketch of that disease. By Thomas Girdlestone, M.D.');
                assert.equal(result[0].language[0], 'eng');
                assert.equal(result[0].publicationDate, '1799');
                assert.equal(result[0].corpusName, 'ecco');
                assert.equal(result[0].qualityIndicators.score, 0.062);
                done();
            });
    });

    it('should get proper last JSON object', (done) => {
        const result = [];
        fs.createReadStream('./examples/data/istex-subset-2019-03-15-10.zip')
            .pipe(ezs('ISTEXUnzip'))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('error', done)
            .on('end', () => {
                assert(result.length > 1);
                assert.equal(typeof result[9], 'object');
                assert.equal(result[9].arkIstex, 'ark:/67375/0T8-SLF4HPPC-X');
                assert.equal(result[9].title,
                    // eslint-disable-next-line max-len
                    'Breath acetone concentration decreases with blood glucose concentration in type I diabetes mellitus patients during hypoglycaemic clamps');
                assert.equal(result[9].language[0], 'eng');
                assert.equal(result[9].publicationDate, '2009');
                assert.equal(result[9].corpusName, 'iop');
                assert.equal(result[9].qualityIndicators.score, 8.247);
                done();
            });
    });

    it('should work on 1000 elements', (done) => {
        const result = [];
        fs.createReadStream('./examples/data/istex-subset-2019-03-15-1000.zip')
            .pipe(ezs('ISTEXUnzip'))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('error', done)
            .on('end', () => {
                assert.equal(result.length, 1000);
                assert.equal(typeof result[999], 'object');
                assert.equal(result[999].arkIstex, 'ark:/67375/QHD-X7WSJP9K-C');
                assert.equal(result[999].title, 'Physiological chemistry');
                assert.equal(result[999].language[0], 'eng');
                assert.equal(result[999].publicationDate, '1894');
                assert.equal(result[999].corpusName, 'rsc-journals');
                assert.equal(result[999].qualityIndicators.score, 2.699);
                done();
            });
    }).timeout(4000);
});

describe.only('ISTEXFacet', () => {
    it('should return aggregations', (done) => {
        const result = [];
        from([{ query: 'ezs', facet: 'publicationDate[perYear]' }])
            .pipe(ezs('ISTEXFacet', { sid: 'test' }))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                console.log(result)
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
    }).timeout(10000);
});
