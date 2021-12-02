import from from 'from';
// @ts-ignore
import ezs from '../../core/src';
import statements from '../src';
import { someBeginsWith } from '../src/filter-tags';

ezs.use(statements);

describe('filter tags', () => {
    it('should keep only adjectives and names, by default', (done) => {
        let res = [];
        /* eslint-disable object-curly-newline */
        from([{
            path: '/path/1',
            terms: [{ id: 0, token: 'elle', tag: ['PRO:per'], lemma: 'elle' },
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
                { id: 7, token: 'frais', tag: ['ADJ'], lemma: 'frais' }]
        }])
        /* eslint-enable object-curly-newline */
            .pipe(ezs('TeeftFilterTags'))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                res = res.concat(chunk);
            })
            .on('end', () => {
                expect(res).toHaveLength(1);
                const { terms } = res[0];
                expect(terms).toHaveLength(2);
                expect(terms[0].tag[0]).toBe('NOM');
                expect(terms[1].tag[0]).toBe('ADJ');
                done();
            });
    });

    it('should keep only passed tag', (done) => {
        let res = [];
        /* eslint-disable object-curly-newline */
        from([{
            terms: [
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
                { id: 7, token: 'frais', tag: ['ADJ'], lemma: 'frais' }]
        }])
        /* eslint-enable object-curly-newline */
            .pipe(ezs('TeeftFilterTags', { tags: ['VER'] }))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                res = res.concat(chunk);
            })
            .on('end', () => {
                expect(res).toHaveLength(1);
                const { terms } = res[0];
                expect(terms).toHaveLength(2);
                expect(terms[0].tag[0]).toBe('VER');
                done();
            });
    });

    it('should keep only passed tags', (done) => {
        let res = [];
        /* eslint-disable object-curly-newline */
        from([{
            terms: [
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
                { id: 7, token: 'frais', tag: ['ADJ'], lemma: 'frais' }]
        }])
        /* eslint-enable object-curly-newline */
            .pipe(ezs('TeeftFilterTags', { tags: ['VER', 'ADJ'] }))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                res = res.concat(chunk);
            })
            .on('end', () => {
                expect(res).toHaveLength(1);
                const { terms } = res[0];
                expect(terms).toHaveLength(3);
                expect(terms[0].tag[0]).toBe('VER');
                expect(terms[2].tag[0]).toBe('ADJ');
                done();
            });
    });

    it('should keep only passed tag (based on the beginning)', (done) => {
        let res = [];
        /* eslint-disable object-curly-newline */
        from([{
            terms: [
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
                { id: 7, token: 'frais', tag: ['ADJ'], lemma: 'frais' }]}])
        /* eslint-enable object-curly-newline */
            .pipe(ezs('TeeftFilterTags', { tags: ['PRO'] }))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                res = res.concat(chunk);
            })
            .on('end', () => {
                expect(res).toHaveLength(1);
                const { terms } = res[0];
                expect(terms).toHaveLength(2);
                expect(terms[0].tag[0]).toBe('PRO:per');
                done();
            });
    });

    it('should keep only passed tag, even if not the first', (done) => {
        let res = [];
        /* eslint-disable object-curly-newline */
        from([{
            terms: [
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
                { id: 7, token: 'frais', tag: ['ADJ'], lemma: 'frais' }]
        }])
        /* eslint-enable object-curly-newline */
            .pipe(ezs('TeeftFilterTags', { tags: ['ART'] }))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                res = res.concat(chunk);
            })
            .on('end', () => {
                expect(res).toHaveLength(1);
                const { terms } = res[0];
                expect(terms[0].tag[1]).toBe('ART:def');
                done();
            });
    });

});

describe('someBeginsWith', () => {
    it('should return true when one text begins with a tag', () => {
        expect(someBeginsWith(['a'],['a:1'])).toBe(true);
    });

    it('should return false when no text begins with a tag', () => {
        expect(someBeginsWith(['a'], ['b:1'])).toBe(false);
    });

    it('should return true when texts is undefined', () => {
        expect(someBeginsWith(['a','b'], undefined)).toBe(true);
    });

    it('should return true when texts is null', () => {
        expect(someBeginsWith(['a','b'], null)).toBe(true);
    });

    it('should return true when texts is []', () => {
        expect(someBeginsWith(['a','b'], [])).toBe(true);
    });
});
