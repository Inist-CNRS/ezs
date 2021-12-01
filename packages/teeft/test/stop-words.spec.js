import from from 'from';
// @ts-ignore
import ezs from '../../core/src';
import statements from '../src';

ezs.use(statements);

describe('stopwords', () => {
    it('should remove stopwords', (done) => {
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
            .pipe(ezs('TeeftStopWords'))
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

    it('should remove uppercase stopwords', (done) => {
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

    it('should remove no term when no stopwords', (done) => {
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
            .pipe(ezs('TeeftStopWords', {stopwords: ''}))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                res = res.concat(chunk);
            })
            .on('end', () => {
                expect(res).toHaveLength(1);
                const { terms } = res[0];
                expect(terms).toHaveLength(3);
                done();
            });
    });

    it('should remove no term when bad filename', (done) => {
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
            .pipe(ezs('TeeftStopWords', { stopwords: 'inexisting.file' }))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                res = res.concat(chunk);
            })
            .on('end', () => {
                expect(res).toHaveLength(1);
                const { terms } = res[0];
                expect(terms).toHaveLength(3);
                done();
            });
    });

});