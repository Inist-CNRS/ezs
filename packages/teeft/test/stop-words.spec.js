import from from 'from';
// @ts-ignore
import ezs from '../../core/src';
import statements from '../src';
import { getResource } from '../src/stop-words';

ezs.use(statements);

describe('stopwords', () => {
    it('should remove French stopwords', (done) => {
        let res = [];
        /* eslint-disable object-curly-newline */
        from([{
            path: '/path/1',
            terms: [
                { term: 'elle', tag: ['PRO'], frequency: 1, length: 1 },
                { term: 'semble', tag: ['VER'], frequency: 1, length: 1 },
                { term: 'se', tag: ['PRO'], frequency: 1, length: 1 },
                { term: 'nourrir', tag: ['VER'], frequency: 1, length: 1 },
                { term: 'essentiellement', tag: ['ADV'], frequency: 1, length: 1 },
                { term: 'de', tag: ['PRP'], frequency: 2, length: 1 },
                { term: 'plancton', tag: ['NOM'], frequency: 1, length: 1 },
                { term: 'et', tag: ['KON'], frequency: 1, length: 1 },
                { term: 'hotdog', tag: ['NOM'], frequency: 1, length: 1 },
            ],
        }])
        /* eslint-enable object-curly-newline */
            .pipe(ezs('TeeftStopWords', { lang: 'fr' }))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                res = res.concat(chunk);
            })
            .on('end', () => {
                expect(res).toHaveLength(1);
                const { terms } = res[0];
                expect(terms).toHaveLength(5);
                done();
            });
    });

    it('should remove uppercase French stopwords', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            terms: [
            /* eslint-disable object-curly-newline */
                { frequency: 1, length: 1, term: 'Introduction', tag: ['NOM'] },
                { frequency: 14, length: 1, term: 'L', tag: ['NOM'] },
                { frequency: 5, length: 1, term: 'accès', tag: ['NOM'] },
            /* eslint-enable object-curly-newline */
            ],
        }])
            .pipe(ezs('TeeftStopWords', { lang: 'fr' }))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                res = res.concat(chunk);
            })
            .on('end', () => {
                expect(res).toHaveLength(1);
                const { terms } = res[0];
                expect(terms).toHaveLength(2);
                done();
            });
    });

    it('should remove English stopwords by default', (done) => {
        let res = [];
        /* eslint-disable object-curly-newline */
        from([{
            path: '/path/1',
            terms: [
                { term: 'she' },
                { term: 'seems' },
                { term: 'to' },
                { term: 'be' },
                { term: 'a' },
                { term: 'really' },
                { term: 'good' },
                { term: 'player' },
            ],
        }])
        /* eslint-enable object-curly-newline */
            .pipe(ezs('TeeftStopWords'))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                res = res.concat(chunk);
            })
            .on('end', () => {
                expect(res).toHaveLength(1);
                const { terms } = res[0];
                expect(terms).toHaveLength(2);
                done();
            });
    });
});

describe('getResource', () => {
    it('should read existing file', async () => {
        const res = await getResource('en-stopwords');
        expect(res).toBeDefined();
        expect(res.length).toBeGreaterThan(0);
    });

    it('should return an empty array when resource not found', async () => {
        const res = await getResource('non-existing');
        expect(res).toBeDefined();
        expect(res).toHaveLength(0);
    });

    it('should return an empty array when no resource given', async () => {
        const res = await getResource();
        expect(res).toBeDefined();
        expect(res).toHaveLength(0);
    });
});