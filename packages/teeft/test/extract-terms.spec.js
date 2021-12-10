import from from 'from';
// @ts-ignore
import ezs from '../../core/src';
import statements from '../src';
import { extractSentenceTerms } from '../src/extract-terms';

ezs.use(statements);

describe('extract terms', () => {
    it('should return 11 terms', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            sentences:
            [[
                { token: 'elle', tag: ['PRO:per'] },
                { token: 'semble', tag: ['VER'] },
                { token: 'se', tag: ['PRO:per'] },
                { token: 'nourrir', tag: ['VER'] },
                {
                    token: 'essentiellement',
                    tag: ['ADV'],
                },
                { token: 'de', tag: ['PRE', 'ART:def'] },
                { token: 'plancton', tag: ['NOM'] },
                { token: 'frais', tag: ['ADJ'] },
                { token: 'et', tag: ['CON'] },
                { token: 'de', tag: ['PRE', 'ART:def'] },
                { token: 'hotdog', tag: ['UNK'] },
            ]],
        }])
            .pipe(ezs('TeeftExtractTerms', { lang: 'fr' }))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                res = res.concat(chunk);
            })
            .on('end', () => {
                expect(res).toHaveLength(1);
                const { terms } = res[0];
                expect(terms).toHaveLength(11);
                expect(terms[0].term).toBe('elle');
                expect(terms[6].term).toBe('plancton');
                expect(terms[7].term).toBe('frais');
                expect(terms[8].term).toBe('plancton frais');
                expect(terms[6]).toMatchObject({
                    term: 'plancton',
                    tag: ['NOM'],
                    frequency: 1,
                    length: 1
                });
                expect(terms[7]).toMatchObject({
                    term: 'frais',
                    tag: ['ADJ'],
                    frequency: 1,
                    length: 1
                });
                expect(terms[8]).toMatchObject({
                    term: 'plancton frais',
                    frequency: 1,
                    length: 2
                });
                expect(terms[8].tag).toBeUndefined();
                done();
            });
    });

    it('should compute correct frequencies', (done) => {
        let res = [];
        /* eslint-disable object-curly-newline */
        from([{
            path: '/path/1',
            sentences:
            [[
                { id: 0, token: 'elle', tag: ['PRO:per'], lemma: 'elle' },
                { id: 1, token: 'semble', tag: ['VER'], lemma: 'sembler' },
                { id: 2, token: 'se', tag: ['PRO:per'], lemma: 'se' },
                { id: 3, token: 'nourrir', tag: ['VER'], lemma: 'nourrir' },
                { id: 4,
                    token: 'essentiellement',
                    tag: ['ADV'],
                    lemma: 'essentiellement',
                },
                { id: 5, token: 'de', tag: ['PRE', 'ART:def'], lemma: 'de' },
                { id: 6, token: 'plancton', tag: ['NOM'], lemma: 'plancton' },
                { id: 7, token: 'frais', tag: ['ADJ'], lemma: 'frais' },
                { id: 8, token: 'et', tag: ['CON'], lemma: 'et' },
                { id: 9, token: 'de', tag: ['PRE', 'ART:def'], lemma: 'de' },
                { id: 10, token: 'hotdog', tag: ['UNK'], lemma: 'hotdog' },
            ]],
        }])
        /* eslint-enable object-curly-newline */
            .pipe(ezs('TeeftExtractTerms', { nounTag: '', adjTag: '' }))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                res = res.concat(chunk);
            })
            .on('end', () => {
                expect(res).toHaveLength(1);
                const { terms } = res[0];
                expect(terms).toHaveLength(11);
                expect(terms[0]).toMatchObject({
                    term: 'elle',
                    lemma: 'elle',
                    tag: ['PRO:per'],
                    frequency: 1,
                });
                expect(terms[5].frequency).toBe(2);
                expect(terms[10]).toHaveLength(11);
                expect(terms[1].frequency).toBe(1); // no undefined
                done();
            });
    });

    it('should return terms from several sentences', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            sentences: [[
                { token: 'elle', tag: ['PRO:per'] },
                { token: 'semble', tag: ['VER'] },
                { token: 'heureuse', tag: ['ADJ'] },
            ], [
                { token: 'mais', tag: ['CON'] },
                { token: 'pas', tag: ['FAKE'] },
                { token: 'lui', tag: ['PRO'] },
            ]],
        }])
            .pipe(ezs('TeeftExtractTerms', { nounTag: '', adjTag: '' }))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                res = res.concat(chunk);
            })
            .on('end', () => {
                expect(res).toHaveLength(1);
                const { terms } = res[0];
                expect(terms).toHaveLength(8); // One multiterm per sentence (no tags given)
                done();
            });
    });

    it('should consider two different documents as different', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            sentences: [[
                { token: 'elle', tag: ['PRO:per'] },
                { token: 'semble', tag: ['VER'] },
                { token: 'heureuse', tag: ['ADJ'] },
            ], [
                { token: 'mais', tag: ['CON'] },
                { token: 'pas', tag: ['FAKE'] },
                { token: 'lui', tag: ['PRO'] },
            ]],
        }, {
            path: '/path/2',
            sentences: [[
                { token: 'elle', tag: ['PRO:per'] },
                { token: 'est', tag: ['VER'] },
                { token: 'là', tag: ['ADV'] },
            ]],
        }])
            .pipe(ezs('TeeftExtractTerms', { nounTag: '', adjTag: '' }))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                res = res.concat(chunk);
            })
            .on('end', () => {
                expect(res).toHaveLength(2);
                const [doc1, doc2] = res;
                const { terms: terms1 } = doc1;
                const { terms: terms2 } = doc2;
                expect(terms1).toHaveLength(8);
                // assert.equal(terms1.length, 8);
                expect(terms1[1]).toMatchObject({ term: 'semble', frequency: 1 });
                expect(terms1[6]).toMatchObject({ term: 'lui', frequency: 1 });
                expect(terms2).toHaveLength(4);
                // frequency 1 is the most important
                expect(terms2[0]).toMatchObject({ term: 'elle', frequency: 1 });
                done();
            });
    });

    it('should transform tokens into terms', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            sentences:
            [[
                { token: 'elle', tag: ['PRO:per'] },
                { token: 'semble', tag: ['VER'] },
                { token: 'se', tag: ['PRO:per'] },
                { token: 'nourrir', tag: ['VER'] },
                {
                    token: 'essentiellement',
                    tag: ['ADV'],
                },
                { token: 'de', tag: ['PRE', 'ART:def'] },
                { token: 'plancton', tag: ['NOM'] },
                { token: 'frais', tag: ['ADJ'] },
                { token: 'et', tag: ['CON'] },
                { token: 'de', tag: ['PRE', 'ART:def'] },
                { token: 'hotdog', tag: ['UNK'] },
            ]],
        }])
            .pipe(ezs('TeeftExtractTerms', { lang: 'fr' }))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                // assert.ok(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                expect(res).toHaveLength(1);
                const { terms } = res[0];
                expect(terms[0].term).toBeDefined();
                expect(terms[0].token).toBeUndefined();
                expect(terms[1].term).toBeDefined();
                expect(terms[1].token).toBeUndefined();
                expect(terms[2].term).toBeDefined();
                expect(terms[2].token).toBeUndefined();
                done();
            });
    });

    it('should return all monoterms', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            sentences:
            [[
                { token: 'elle', tag: ['PRO:per'] },
                { token: 'semble', tag: ['VER'] },
                { token: 'se', tag: ['PRO:per'] },
                { token: 'nourrir', tag: ['VER'] },
                {
                    token: 'essentiellement',
                    tag: ['ADV'],
                },
                { token: 'de', tag: ['PRE', 'ART:def'] },
                { token: 'plancton', tag: ['NOM'] },
                { token: 'frais', tag: ['ADJ'] },
                { token: 'et', tag: ['CON'] },
                { token: 'de', tag: ['PRE', 'ART:def'] },
                { token: 'hotdog', tag: ['UNK'] },
            ]],
        }])
            .pipe(ezs('TeeftExtractTerms', { lang: 'fr' }))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                res = res.concat(chunk);
            })
            .on('end', () => {
                expect(res).toHaveLength(1);
                const { terms } = res[0];
                expect(terms).toHaveLength(11);
                expect(terms).toEqual([{
                    frequency: 1,
                    length: 1,
                    tag: ['PRO:per'],
                    term: 'elle',
                }, {
                    frequency: 1,
                    length: 1,
                    tag: ['VER'],
                    term: 'semble',
                }, {
                    frequency: 1, length: 1, tag: ['PRO:per'], term: 'se',
                }, {
                    frequency: 1,
                    length: 1,
                    tag: ['VER'],
                    term: 'nourrir',
                }, {
                    frequency: 1,
                    length: 1,
                    tag: ['ADV'],
                    term: 'essentiellement',
                }, {
                    frequency: 2, length: 1, tag: ['PRE', 'ART:def'], term: 'de',
                }, {
                    frequency: 1,
                    length: 1,
                    tag: ['NOM'],
                    term: 'plancton',
                }, {
                    frequency: 1,
                    length: 1,
                    tag: ['ADJ'],
                    term: 'frais',
                }, {
                    frequency: 1,
                    length: 2,
                    term: 'plancton frais',
                }, {
                    frequency: 1, length: 1, tag: ['CON'], term: 'et',
                }, {
                    frequency: 1,
                    length: 1,
                    tag: ['UNK'],
                    term: 'hotdog',
                }]);
                done();
            });
    });

    it('should work on English tags', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            sentences:
            [[
                { token: 'this', tag: ['DT'] },
                { token: 'preliminary', tag: ['JJ'] },
                { token: 'study', tag: ['NN'] },
                { token: 'has', tag: ['VBZ'] },
                { token: 'interesting', tag: ['JJ'] },
                { token: 'perspectives', tag: [ 'NNS' ] },
            ]],
        }])
            .pipe(ezs('TeeftExtractTerms', { lang: 'en' }))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                res = res.concat(chunk);
            })
            .on('end', () => {
                expect(res).toHaveLength(1);
                const { terms } = res[0];
                expect(terms).toHaveLength(8);
                expect(terms[0].term).toBe('this');
                expect(terms[1].term).toBe('preliminary');
                expect(terms[2].term).toBe('study');
                expect(terms[3].term).toBe('preliminary study');
                expect(terms[5]).toMatchObject({
                    term: 'interesting',
                    tag: ['JJ'],
                    frequency: 1,
                    length: 1
                });
                expect(terms[6]).toMatchObject({
                    term: 'perspectives',
                    tag: ['NNS'],
                    frequency: 1,
                    length: 1
                });
                expect(terms[7]).toMatchObject({
                    term: 'interesting perspectives',
                    frequency: 1,
                    length: 2
                });
                expect(terms[7].tag).toBeUndefined();
                done();
            });
    });
});

describe('extract sentence\'s terms', () => {
    it('should return 11 terms', () => {
        const taggedWords = [
            { token: 'elle', tag: ['PRO:per'] },
            { token: 'semble', tag: ['VER'] },
            { token: 'se', tag: ['PRO:per'] },
            { token: 'nourrir', tag: ['VER'] },
            {
                token: 'essentiellement',
                tag: ['ADV'],
            },
            { token: 'de', tag: ['PRE', 'ART:def'] },
            { token: 'plancton', tag: ['NOM'] },
            { token: 'frais', tag: ['ADJ'] },
            { token: 'et', tag: ['CON'] },
            { token: 'de', tag: ['PRE', 'ART:def'] },
            { token: 'hotdog', tag: ['UNK'] },
        ];
        const { termSequence, termFrequency } = extractSentenceTerms(
            taggedWords,
            { termSequence: [], termFrequency: {} },
        );
        expect(termSequence).toHaveLength(11);
        expect(termSequence).toEqual([
            'elle', 'semble', 'se', 'nourrir', 'essentiellement',
            'de', 'plancton', 'frais', 'plancton frais', 'et', 'hotdog',
        ]);
        expect(termFrequency).toEqual({
            de: 2,
            elle: 1,
            essentiellement: 1,
            et: 1,
            frais: 1,
            hotdog: 1,
            nourrir: 1,
            plancton: 1,
            'plancton frais': 1,
            se: 1,
            semble: 1,
        });
    });

    it('should compute correct frequencies', () => {
        const taggedWords = [
            { token: 'elle', tag: ['PRO:per'] },
            { token: 'semble', tag: ['VER'] },
            { token: 'se', tag: ['PRO:per'] },
            { token: 'nourrir', tag: ['VER'] },
            {
                token: 'essentiellement',
                tag: ['ADV'],
            },
            { token: 'de', tag: ['PRE', 'ART:def'] },
            { token: 'plancton', tag: ['NOM'] },
            { token: 'frais', tag: ['ADJ'] },
            { token: 'et', tag: ['CON'] },
            { token: 'de', tag: ['PRE', 'ART:def'] },
            { token: 'hotdog', tag: ['UNK'] },
        ];
        const { termFrequency } = extractSentenceTerms(taggedWords, { termSequence: [], termFrequency: {} }, '', '');
        expect(Object.keys(termFrequency)).toHaveLength(11);
        expect(termFrequency.elle).toBe(1);
        expect(termFrequency.de).toBe(2);
    });
});
