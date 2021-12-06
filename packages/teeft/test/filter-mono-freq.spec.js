import from from 'from';
// @ts-ignore
import ezs from '../../core/src';
import statements from '../src';

ezs.use(statements);

describe('filter multiterms and frequent monoterms', () => {
    it('should keep frequent monoterms', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            terms: [
                /* eslint-disable object-curly-newline */
                { frequency: 8, length: 1, term: 'elle', tag: ['PRO:per'], lemma: 'elle' },
                { frequency: 1, length: 1, term: 'semble', tag: ['VER'], lemma: 'sembler' },
                { frequency: 1, length: 1, term: 'se', tag: ['PRO:per'], lemma: 'se' },
                { frequency: 1, length: 1, term: 'nourrir', tag: ['VER'], lemma: 'nourrir' },
                { frequency: 1, length: 1, term: 'essentiellement', tag: ['ADV'], lemma: 'essentiellement' },
                { frequency: 2, length: 1, term: 'de', tag: ['PRE', 'ART:def'], lemma: 'de' },
                { frequency: 1, length: 1, term: 'plancton', tag: ['NOM'], lemma: 'plancton' },
                { frequency: 1, length: 1, term: 'frais', tag: ['ADJ'], lemma: 'frais' },
                { frequency: 1, length: 1, term: 'et', tag: ['CON'], lemma: 'et' },
                { frequency: 1, length: 1, term: 'hotdog', tag: ['UNK'], lemma: 'hotdog' },
                /* eslint-enable object-curly-newline */
            ],
        }])
            .pipe(ezs('TeeftFilterMonoFreq'))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                res = res.concat(chunk);
            })
            .on('end', () => {
                expect(res).toHaveLength(1);
                const { terms } = res[0];
                expect(terms).toHaveLength(2);
                expect(terms[0]).toMatchObject({ term: 'elle', frequency: 8 });
                expect(terms[1]).toMatchObject({ term: 'de', frequency: 2 });
                done();
            });
    });

    it('should keep multiterms', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            terms: [
                /* eslint-disable object-curly-newline */
                { frequency: 1, length: 1, term: 'elle', tag: ['PRO:per'], lemma: 'elle' },
                { frequency: 1, length: 1, term: 'semble', tag: ['VER'], lemma: 'sembler' },
                { frequency: 1, length: 1, term: 'se', tag: ['PRO:per'], lemma: 'se' },
                { frequency: 1, length: 1, term: 'nourrir', tag: ['VER'], lemma: 'nourrir' },
                { frequency: 1, length: 1, term: 'essentiellement', tag: ['ADV'], lemma: 'essentiellement' },
                { frequency: 2, length: 1, term: 'de', tag: ['PRE', 'ART:def'], lemma: 'de' },
                { frequency: 1, length: 6, term: 'elle sembler se nourrir essentiellement de' },
                { frequency: 1, length: 1, term: 'plancton', tag: ['NOM'], lemma: 'plancton' },
                { frequency: 1, length: 1, term: 'frais', tag: ['ADJ'], lemma: 'frais' },
                { frequency: 1, length: 1, term: 'et', tag: ['CON'], lemma: 'et' },
                { frequency: 1, length: 1, term: 'hotdog', tag: ['UNK'], lemma: 'hotdog' },
                { frequency: 1, length: 5, term: 'plancton frais et de hotdog' },
                /* eslint-enable object-curly-newline */
            ],
        }])
            .pipe(ezs('TeeftFilterMonoFreq'))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                res = res.concat(chunk);
            })
            .on('end', () => {
                expect(res).toHaveLength(1);
                const { terms } = res[0];
                expect(terms).toHaveLength(2);
                expect(terms[0].term).toBe('elle sembler se nourrir essentiellement de');
                expect(terms[1].term).toBe('plancton frais et de hotdog');
                done();
            });
    });
});
