import from from 'from';
// @ts-ignore
import ezs from '../../core/src';
import statements from '../src';

ezs.use(statements);

describe('compute specificity', () => {
    it('should work without weights', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            terms: [
                /* eslint-disable object-curly-newline */
                { frequency: 8, length: 1, term: 'elle', id: 0, tag: ['PRO:per'], lemma: 'elle' },
                { frequency: 1, length: 1, term: 'semble', id: 1, tag: ['VER'], lemma: 'sembler' },
                { frequency: 1, length: 1, term: 'se', id: 2, tag: ['PRO:per'], lemma: 'se' },
                { frequency: 1, length: 1, term: 'nourrir', id: 3, tag: ['VER'], lemma: 'nourrir' },
                { frequency: 1, length: 1, term: 'essentiellement', id: 4, tag: ['ADV'], lemma: 'essentiellement' },
                { frequency: 2, length: 1, term: 'de', id: 9, tag: ['PRE', 'ART:def'], lemma: 'de' },
                { frequency: 1, length: 1, term: 'plancton', id: 6, tag: ['NOM'], lemma: 'plancton' },
                { frequency: 1, length: 1, term: 'frais', id: 7, tag: ['ADJ'], lemma: 'frais' },
                { frequency: 1, length: 1, term: 'et', id: 8, tag: ['CON'], lemma: 'et' },
                { frequency: 1, length: 1, term: 'hotdog', id: 10, tag: ['UNK'], lemma: 'hotdog' },
                /* eslint-enable object-curly-newline */
            ],
        }])
            .pipe(ezs('TeeftSpecificity', { weightedDictionary: null, filter: false }))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                res = res.concat(chunk);
            })
            .on('end', () => {
                expect(res).toHaveLength(1);
                const { terms } = res[0];
                expect(terms).toHaveLength(10);
                expect(terms[0]).toMatchObject({ lemma: 'elle', frequency: 8, specificity: 1 });
                done();
            });
    });

    it('should work with weights', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            terms: [
                /* eslint-disable object-curly-newline */
                { frequency: 1, length: 1, term: 'semble', id: 1, tag: ['VER'], lemma: 'sembler' },
                { frequency: 1, length: 1, term: 'nourrir', id: 3, tag: ['VER'], lemma: 'nourrir' },
                { frequency: 1, length: 1, term: 'essentiellement', id: 4, tag: ['ADV'], lemma: 'essentiellement' },
                { frequency: 1, length: 1, term: 'plancton', id: 6, tag: ['NOM'], lemma: 'plancton' },
                { frequency: 1, length: 1, term: 'frais', id: 7, tag: ['ADJ'], lemma: 'frais' },
                { frequency: 1, length: 1, term: 'hotdog', id: 10, tag: ['UNK'], lemma: 'hotdog' },
                /* eslint-enable object-curly-newline */
            ],
        }])
            .pipe(ezs('TeeftSpecificity', { filter: false }))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                res = res.concat(chunk);
            })
            .on('end', () => {
                expect(res).toHaveLength(1);
                const { terms } = res[0];
                expect(terms).toHaveLength(6);
                expect(terms[0]).toMatchObject({
                    term: 'semble',
                    frequency: 1,
                });
                expect(terms[0].specificity).toBeCloseTo(0.0008964346775894242, 16);
                done();
            });
    });

    it('should work with weights and filter', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            terms: [
                /* eslint-disable object-curly-newline */
                { frequency: 1, length: 1, term: 'semble', id: 1, tag: ['VER'], lemma: 'sembler' },
                { frequency: 1, length: 1, term: 'nourrir', id: 3, tag: ['VER'], lemma: 'nourrir' },
                { frequency: 1, length: 1, term: 'essentiellement', id: 4, tag: ['ADV'], lemma: 'essentiellement' },
                { frequency: 1, length: 1, term: 'plancton', id: 6, tag: ['NOM'], lemma: 'plancton' },
                { frequency: 1, length: 1, term: 'frais', id: 7, tag: ['ADJ'], lemma: 'frais' },
                { frequency: 1, length: 1, term: 'hotdog', id: 10, tag: ['UNK'], lemma: 'hotdog' },
                /* eslint-enable object-curly-newline */
            ],
        }])
            .pipe(ezs('TeeftSpecificity'))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                res = res.concat(chunk);
            })
            .on('end', () => {
                expect(res).toHaveLength(1);
                const { terms } = res[0];
                expect(terms).toHaveLength(1);
                expect(terms[0]).toMatchObject({ lemma: 'hotdog', frequency: 1, specificity: 1 });
                done();
            });
    });

    it('should sort when asked', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            terms: [
                /* eslint-disable object-curly-newline */
                { frequency: 8, length: 1, term: 'elle', id: 0, tag: ['PRO:per'], lemma: 'elle' },
                { frequency: 1, length: 1, term: 'semble', id: 1, tag: ['VER'], lemma: 'sembler' },
                { frequency: 1, length: 1, term: 'se', id: 2, tag: ['PRO:per'], lemma: 'se' },
                { frequency: 1, length: 1, term: 'nourrir', id: 3, tag: ['VER'], lemma: 'nourrir' },
                { frequency: 1, length: 1, term: 'essentiellement', id: 4, tag: ['ADV'], lemma: 'essentiellement' },
                { frequency: 2, length: 1, term: 'de', id: 9, tag: ['PRE', 'ART:def'], lemma: 'de' },
                { frequency: 1, length: 1, term: 'plancton', id: 6, tag: ['NOM'], lemma: 'plancton' },
                { frequency: 1, length: 1, term: 'frais', id: 7, tag: ['ADJ'], lemma: 'frais' },
                { frequency: 1, length: 1, term: 'et', id: 8, tag: ['CON'], lemma: 'et' },
                { frequency: 1, length: 1, term: 'hotdog', id: 10, tag: ['UNK'], lemma: 'hotdog' },
                /* eslint-enable object-curly-newline */
            ],
        }])
            .pipe(ezs('TeeftSpecificity', { sort: true, weightedDictionary: '', filter: false }))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                res = res.concat(chunk);
            })
            .on('end', () => {
                expect(res).toHaveLength(1);
                const { terms } = res[0];
                expect(terms).toHaveLength(10);
                for (let i = 0; i < terms.length - 1; i += 1) {
                    expect(terms[i].specificity).toBeGreaterThanOrEqual(terms[i+1].specificity);
                }
                done();
            });
    });

    it('should work whatever the order of terms', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            terms: [
                /* eslint-disable object-curly-newline */
                { frequency: 1, length: 1, term: 'semble', id: 1, tag: ['VER'], lemma: 'sembler' },
                { frequency: 1, length: 1, term: 'se', id: 2, tag: ['PRO:per'], lemma: 'se' },
                { frequency: 1, length: 1, term: 'nourrir', id: 3, tag: ['VER'], lemma: 'nourrir' },
                { frequency: 1, length: 1, term: 'essentiellement', id: 4, tag: ['ADV'], lemma: 'essentiellement' },
                { frequency: 2, length: 1, term: 'de', id: 9, tag: ['PRE', 'ART:def'], lemma: 'de' },
                { frequency: 1, length: 1, term: 'plancton', id: 6, tag: ['NOM'], lemma: 'plancton' },
                { frequency: 1, length: 1, term: 'frais', id: 7, tag: ['ADJ'], lemma: 'frais' },
                { frequency: 1, length: 1, term: 'et', id: 8, tag: ['CON'], lemma: 'et' },
                { frequency: 1, length: 1, term: 'hotdog', id: 10, tag: ['UNK'], lemma: 'hotdog' },
                { frequency: 8, length: 1, term: 'elle', id: 0, tag: ['PRO:per'], lemma: 'elle' },
                /* eslint-enable object-curly-newline */
            ],
        }])
            .pipe(ezs('TeeftSpecificity', { sort: true, weightedDictionary: '', filter: false }))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                res = res.concat(chunk);
            })
            .on('end', () => {
                expect(res).toHaveLength(1);
                const { terms } = res[0];
                expect(terms).toHaveLength(10);
                expect(terms.find(t => t.term === 'elle').specificity).toBe(1);
                expect(terms.find(t => t.term === 'de').specificity).toBe(0.25);
                expect(terms.find(t => t.term === 'semble').specificity).toBe(0.125);
                done();
            });
    });

    it('should keep multiterms (terms without tags)', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            terms: [
                /* eslint-disable object-curly-newline */
                { frequency: 3, length: 1, term: 'logiciel', id: 2703, tag: ['ADJ', 'NOM'], lemma: 'logiciel' },
                { frequency: 1, length: 1, term: 'content', id: 2704, tag: ['NOM', 'ADJ', 'VER'], lemma: 'content' },
                { frequency: 1, length: 2, term: 'logiciel content' },
                { frequency: 1, length: 1, term: 'management', id: 2706, tag: ['NOM'], lemma: 'management' },
                /* eslint-enable object-curly-newline */
            ],
        }])
            .pipe(ezs('TeeftSpecificity', { sort: true, weightedDictionary: '', filter: true }))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                res = res.concat(chunk);
            })
            .on('end', () => {
                expect(res).toHaveLength(1);
                const { terms } = res[0];
                expect(terms).toHaveLength(2);
                expect(terms[0]).toMatchObject({ lemma: 'logiciel', frequency: 3, specificity: 1 });
                expect(terms[1]).toMatchObject({
                    term: 'logiciel content',
                    frequency: 1,
                    length: 2,
                    specificity: 1/3
                });
                done();
            });
    });

    it('should compute average specificity only on monoterms', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            terms: [
                /* eslint-disable object-curly-newline */
                { frequency: 1, length: 1, term: 'logiciel', id: 2703, tag: ['ADJ', 'NOM'], lemma: 'logiciel' },
                { frequency: 1, length: 1, term: 'content', id: 2704, tag: ['NOM', 'ADJ', 'VER'], lemma: 'content' },
                { frequency: 10, length: 2, term: 'logiciel content' },
                { frequency: 1, length: 1, term: 'management', id: 2706, tag: ['NOM'], lemma: 'management' },
                /* eslint-enable object-curly-newline */
            ],
        }])
            .pipe(ezs('TeeftSpecificity', { sort: true, filter: true }))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                res = res.concat(chunk);
            })
            .on('end', () => {
                expect(res).toHaveLength(1);
                const { terms } = res[0];
                expect(terms).toHaveLength(2);
                expect(terms[0].tag).toBeUndefined(); // multiterm
                expect(terms[0].specificity).toBe(1);
                done();
            });
    });

    it('should not crash when input is empty', (done) => {
        let res = [];
        let err;
        from([])
            .pipe(ezs('TeeftSpecificity'))
            // .pipe(ezs('debug'))
            .pipe(ezs.catch((error) => { err = error; }))
            .on('data', (chunk) => {
                res = res.concat(chunk);
            })
            .on('end', () => {
                expect(res).toHaveLength(0);
                done(err);
            })
            .on('error', done);
    });

    it('should work on several documents', (done) => {
        let res = [];
        /* eslint-disable object-curly-newline */
        from([{
            path: '/path/1',
            terms: [
                { frequency: 3, length: 1, term: 'logiciel', id: 2703, tag: ['ADJ', 'NOM'], lemma: 'logiciel' },
                { frequency: 1, length: 1, term: 'content', id: 2704, tag: ['NOM', 'ADJ', 'VER'], lemma: 'content' },
                { frequency: 1, length: 2, term: 'logiciel content' },
            ],
        }, {
            path: '/path/2',
            terms: [
                { frequency: 1, length: 1, term: 'management', id: 2706, tag: ['NOM'], lemma: 'management' },
            ],
        }])
        /* eslint-enable object-curly-newline */
            .pipe(ezs('TeeftSpecificity', { sort: true, weightedDictionary: '', filter: false }))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                res = res.concat(chunk);
            })
            .on('end', () => {
                expect(res).toHaveLength(2);
                const { terms: terms1 } = res[0];
                const { terms: terms2 } = res[1];

                expect(terms1).toHaveLength(3);
                expect(terms1[0]).toMatchObject({ lemma: 'logiciel', frequency: 3, specificity: 1 });

                expect(terms1[2]).toMatchObject({ term: 'logiciel content', frequency: 1, length: 2});
                expect(terms1[2].specificity).toBeCloseTo(1 / 3, 3);
                // expect(Math.floor(terms1[2].specificity * 1000)).toBe(Math.floor(1 / 3 * 1000));

                expect(terms2).toHaveLength(1);
                expect(terms2[0]).toMatchObject({ term: 'management', frequency: 1, specificity: 1});
                done();
            });
    });
});
