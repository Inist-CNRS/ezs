import from from 'from';
// @ts-ignore
import ezs from '../../core/src';
import statements from '../src';

ezs.use(statements);

describe('filter-multi-spec', () => {
    it('should return all monoterms', (done) => {
        let res = [];
        const input = {
            path: '/path/1',
            terms: [
                { length: 1, term: 'elle', tag: ['PRO:per'] },
                { length: 1, term: 'semble', tag: ['VER'] },
                { length: 1, term: 'se', tag: ['PRO:per'] },
                { length: 1, term: 'nourrir', tag: ['VER'] },
                { length: 1, term: 'essentiellement', tag: ['ADV'] },
                { length: 1, term: 'de', tag: ['PRE', 'ART:def'] },
                { length: 1, term: 'plancton', tag: ['NOM'] },
                { length: 1, term: 'frais', tag: ['ADJ'] },
                { length: 1, term: 'et', tag: ['CON'] },
                { length: 1, term: 'hotdog', tag: ['UNK'] },
            ],
        };
        from([input])
            .pipe(ezs('TeeftFilterMultiSpec'))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                res = res.concat(chunk);
            })
            .on('end', () => {
                expect(res).toHaveLength(1);
                const { terms } = res[0];
                expect(terms.length).toBe(input.terms.length);
                done();
            });
    });

    it('should return all multiterms above average spec', (done) => {
        let res = [];
        const input = {
            path: '/path/1',
            terms: [
                { length: 2, specificity: 0.5, term: 'apprentissage automatique' },
                { length: 3, specificity: 0.5, term: 'réseau de neurones' },
                { length: 4, specificity: 0.24, term: 'information scientifique et technique' },
                { length: 4, specificity: 0.75, term: 'enseignement supérieur et recherche' },
            ],
        };
        from([input])
            .pipe(ezs('TeeftFilterMultiSpec'))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                res = res.concat(chunk);
            })
            .on('end', () => {
                expect(res).toHaveLength(1);
                const { terms } = res[0];
                expect(terms).toHaveLength(3);
                expect(terms[0]).toMatchObject({ specificity: 0.5, term: 'apprentissage automatique' });
                expect(terms[2]).toMatchObject({ specificity: 0.75, term: 'enseignement supérieur et recherche' });
                done();
            });
    });

    it('should return all multiterms above average spec, and all monoterms', (done) => {
        let res = [];
        const input = {
            path: '/path/1',
            terms: [
                { length: 2, specificity: 0.5, token: 'apprentissage automatique' },
                { length: 3, specificity: 0.5, token: 'réseau de neurones' },
                { length: 4, specificity: 0.24, token: 'information scientifique et technique' },
                { length: 4, specificity: 0.75, token: 'enseignement supérieur et recherche' },
                { length: 1, token: 'elle', tag: ['PRO:per'] },
                { length: 1, token: 'semble', tag: ['VER'] },
            ],
        };
        from([input])
            .pipe(ezs('TeeftFilterMultiSpec'))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                res = res.concat(chunk);
            })
            .on('end', () => {
                expect(res).toHaveLength(1);
                const { terms } = res[0];
                expect(terms).toHaveLength(5);
                expect(terms[0]).toMatchObject({ specificity: 0.5, token: 'apprentissage automatique' });
                expect(terms[2]).toMatchObject({ specificity: 0.75, token: 'enseignement supérieur et recherche' });
                done();
            });
    });
});
