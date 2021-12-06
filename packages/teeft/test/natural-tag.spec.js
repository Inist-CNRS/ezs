import from from 'from';
// @ts-ignore
import ezs from '../../core/src';
import statements from '../src';

ezs.use(statements);

describe('tag', () => {
    it('should correctly tag a sentence in French', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            sentences: [
                ['Elle', 'semble', 'se', 'nourrir', 'essentiellement', 'de', 'plancton', 'et', 'de', 'hotdog'],
            ],
        }])
            .pipe(ezs('TeeftNaturalTag'))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                res = res.concat(chunk);
            })
            .on('end', () => {
                expect(res).toHaveLength(1);
                expect(res[0].sentences).toHaveLength(1);
                const firstSentence = res[0].sentences[0];
                expect(firstSentence).toHaveLength(10);
                expect(firstSentence[1]).toMatchObject({token: 'semble', tag: ['VER']});
                expect(firstSentence[4]).toMatchObject({token: 'essentiellement', tag: ['ADV']});
                done();
            });
    });

    it('should correctly tag a sentence in French with accented words', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            sentences: [['Ça', 'veut', 'sûrement', 'dire', 'qu\'', 'il', 'fut', 'assassiné']],
        }])
            .pipe(ezs('TeeftNaturalTag'))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                // assert(chunk);
                // assert(Array.isArray(chunk));
                res = res.concat(chunk);
            })
            .on('end', () => {
                expect(res).toHaveLength(1);
                expect(res[0].sentences).toHaveLength(1);
                const firstSentence = res[0].sentences[0];
                expect(firstSentence).toHaveLength(8);
                expect(firstSentence[1]).toMatchObject({token: 'veut', tag: ['VER']});
                expect(firstSentence[2]).toMatchObject({token: 'sûrement', tag:['ADV']});
                done();
            });
    });

    it('should correctly tag two sentences in French with accented words', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            sentences: [
                ['Ça', 'veut', 'sûrement', 'dire', 'qu\'', 'il', 'fut', 'assassiné'],
                ['Mais', 'j\'', 'espère', 'que', 'ce', 'n\'', 'était', 'pas', 'grave'],
            ],
        }])
            .pipe(ezs('TeeftNaturalTag'))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                res = res.concat(chunk);
            })
            .on('end', () => {
                expect(res).toHaveLength(1);
                expect(res[0].sentences).toHaveLength(2);
                const firstSentence = res[0].sentences[0];
                expect(firstSentence).toHaveLength(8);
                expect(firstSentence[1]).toMatchObject({token: 'veut', tag: ['VER']});
                expect(firstSentence[2]).toMatchObject({token: 'sûrement', tag: ['ADV']});
                const secondSentence = res[0].sentences[1];
                expect(secondSentence).toHaveLength(9);
                expect(secondSentence[0]).toMatchObject({token: 'Mais', tag: ['KON']});
                expect(secondSentence[1]).toMatchObject({token: 'j\'', tag: ['PRO']});
                done();
            });
    });
});
