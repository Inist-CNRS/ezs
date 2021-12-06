import from from 'from';
// @ts-ignore
import ezs from '../../core/src';
import statements from '../src';

ezs.use(statements);

describe('sum up frequencies', () => {
    it('should sum up frequencies in several sentences', (done) => {
        const res = [];
        /* eslint-disable object-curly-newline */
        from([{
            path: '/path/1',
            sentences: [[
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
            ], [
                { id: 6, token: 'plancton', tag: ['NOM'], lemma: 'plancton' },
                { id: 7, token: 'frais', tag: ['ADJ'], lemma: 'frais' },
                { id: 8, token: 'et', tag: ['CON'], lemma: 'et' },
                { id: 9, token: 'de', tag: ['PRE', 'ART:def'], lemma: 'de' },
                { id: 10, token: 'hotdog', tag: ['UNK'], lemma: 'hotdog' },
            ]],
        }])
        /* eslint-enable object-curly-newline */
            .pipe(ezs('TeeftExtractTerms', { nounTag: '', adjTag: '' }))
            .pipe(ezs('TeeftSumUpFrequencies'))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                expect(chunk).toBeInstanceOf(Object);
                res.push(chunk);
            })
            .on('end', () => {
                expect(res).toHaveLength(1);
                const { terms } = res[0];
                expect(terms).toHaveLength(12);
                expect(terms[5]).toMatchObject({ term: 'de', lemma: 'de', frequency: 2 });
                done();
            });
    });

    it('should sum up frequencies in several sentences, and no lemma', (done) => {
        const res = [];
        /* eslint-disable object-curly-newline */
        from([{
            path: '/path/1',
            sentences: [[
                { id: 0, token: 'elle', tag: ['PRO:per'] },
                { id: 1, token: 'semble', tag: ['VER'] },
                { id: 2, token: 'se', tag: ['PRO:per'] },
                { id: 3, token: 'nourrir', tag: ['VER'] },
                { id: 4,
                    token: 'essentiellement',
                    tag: ['ADV'],
                },
                { id: 5, token: 'de', tag: ['PRE', 'ART:def'] },
            ], [
                { id: 6, token: 'plancton', tag: ['NOM'] },
                { id: 7, token: 'frais', tag: ['ADJ'] },
                { id: 8, token: 'et', tag: ['CON'] },
                { id: 9, token: 'de', tag: ['PRE', 'ART:def'] },
                { id: 10, token: 'hotdog', tag: ['UNK'] },
            ]],
        }])
        /* eslint-enable object-curly-newline */
            .pipe(ezs('TeeftExtractTerms', { nounTag: '', adjTag: '' }))
            // .pipe(ezs('debug'))
            .pipe(ezs('TeeftSumUpFrequencies'))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                expect(chunk).toBeInstanceOf(Object);
                res.push(chunk);
            })
            .on('end', () => {
                expect(res).toHaveLength(1);
                const { terms } = res[0];
                expect(terms).toHaveLength(12);
                expect(terms[5]).toMatchObject({ term: 'de', frequency: 2 });
                done();
            });
    });
});
