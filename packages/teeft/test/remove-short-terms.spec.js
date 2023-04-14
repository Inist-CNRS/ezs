import from from 'from';
// @ts-ignore
import ezs from '../../core/src';
import statements from '../src';

ezs.use(statements);

describe('remove short terms', () => {
    it('should remove 2-character long term', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            terms: [
                { frequency: 78, length: 1, tag: [], term: 'ab' },
                { frequency: 4, length: 1, tag: [], term: 'aide' },
                { frequency: 2, length: 1, tag: [], term: 'expertise' },
                { frequency: 29, length: 1, tag: [], term: 'brevets' },
                { frequency: 1, length: 1, tag: [], term: 'alignement' },
                { frequency: 6, length: 1, tag: [], term: 'publications' },
                { frequency: 11, length: 1, tag: [], term: 'scientifiques' },
                { frequency: 1, length: 2, term: 'publications scientifiques' },
            ]
        }])
            .pipe(ezs('TeeftRemoveShortTerms'))
            .on('data', (data) => {
                res = res.concat(data);
            })
            .on('error', done)
            .on('end', () => {
                expect(res).toHaveLength(1);
                const { terms } = res[0];
                expect(terms).toHaveLength(7);
                done();
            });
    });

    it('should not remove 3-character long term', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            terms: [
                { frequency: 78, length: 1, tag: [], term: 'abc' },
                { frequency: 4, length: 1, tag: [], term: 'aide' },
                { frequency: 2, length: 1, tag: [], term: 'expertise' },
                { frequency: 29, length: 1, tag: [], term: 'brevets' },
                { frequency: 1, length: 1, tag: [], term: 'alignement' },
                { frequency: 6, length: 1, tag: [], term: 'publications' },
                { frequency: 11, length: 1, tag: [], term: 'scientifiques' },
                { frequency: 1, length: 2, term: 'publications scientifiques' },
            ]
        }])
            .pipe(ezs('TeeftRemoveShortTerms'))
            .on('data', (data) => {
                res = res.concat(data);
            })
            .on('error', done)
            .on('end', () => {
                expect(res).toHaveLength(1);
                const { terms } = res[0];
                expect(terms).toHaveLength(8);
                done();
            });
    });

    it('should remove 1-character long term', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            terms: [
                { frequency: 78, length: 1, tag: [], term: 'a' },
                { frequency: 4, length: 1, tag: [], term: 'aide' },
                { frequency: 2, length: 1, tag: [], term: 'expertise' },
                { frequency: 29, length: 1, tag: [], term: 'brevets' },
                { frequency: 1, length: 1, tag: [], term: 'alignement' },
                { frequency: 6, length: 1, tag: [], term: 'publications' },
                { frequency: 11, length: 1, tag: [], term: 'scientifiques' },
                { frequency: 1, length: 2, term: 'publications scientifiques' },
            ]
        }])
            .pipe(ezs('TeeftRemoveShortTerms'))
            .on('data', (data) => {
                res = res.concat(data);
            })
            .on('error', done)
            .on('end', () => {
                expect(res).toHaveLength(1);
                const { terms } = res[0];
                expect(terms).toHaveLength(7);
                done();
            });
    });

    it('should remove 1-character long terms', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            terms: [
                { frequency: 78, length: 1, tag: [], term: 'a' },
                { frequency: 7, length: 1, tag: [], term: 'b' },
                { frequency: 4, length: 1, tag: [], term: 'aide' },
                { frequency: 2, length: 1, tag: [], term: 'expertise' },
                { frequency: 29, length: 1, tag: [], term: 'brevets' },
                { frequency: 1, length: 1, tag: [], term: 'alignement' },
                { frequency: 6, length: 1, tag: [], term: 'publications' },
                { frequency: 11, length: 1, tag: [], term: 'scientifiques' },
                { frequency: 1, length: 2, term: 'publications scientifiques' },
            ]
        }])
            .pipe(ezs('TeeftRemoveShortTerms'))
            .on('data', (data) => {
                res = res.concat(data);
            })
            .on('error', done)
            .on('end', () => {
                expect(res).toHaveLength(1);
                const { terms } = res[0];
                expect(terms).toHaveLength(7);
                done();
            });
    });

    it('should remove 1-character long term not at the beginning', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            terms: [
                { frequency: 4, length: 1, tag: [], term: 'aide' },
                { frequency: 2, length: 1, tag: [], term: 'expertise' },
                { frequency: 78, length: 1, tag: [], term: 'a' },
                { frequency: 29, length: 1, tag: [], term: 'brevets' },
                { frequency: 1, length: 1, tag: [], term: 'alignement' },
                { frequency: 6, length: 1, tag: [], term: 'publications' },
                { frequency: 11, length: 1, tag: [], term: 'scientifiques' },
                { frequency: 1, length: 2, term: 'publications scientifiques' },
            ]
        }])
            .pipe(ezs('TeeftRemoveShortTerms'))
            .on('data', (data) => {
                res = res.concat(data);
            })
            .on('error', done)
            .on('end', () => {
                expect(res).toHaveLength(1);
                const { terms } = res[0];
                expect(terms).toHaveLength(7);
                done();
            });
    });

    it('should remove 1-character long term at the end', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            terms: [
                { frequency: 4, length: 1, tag: [], term: 'aide' },
                { frequency: 2, length: 1, tag: [], term: 'expertise' },
                { frequency: 29, length: 1, tag: [], term: 'brevets' },
                { frequency: 1, length: 1, tag: [], term: 'alignement' },
                { frequency: 6, length: 1, tag: [], term: 'publications' },
                { frequency: 11, length: 1, tag: [], term: 'scientifiques' },
                { frequency: 1, length: 2, term: 'publications scientifiques' },
                { frequency: 78, length: 1, tag: [], term: 'a' },
            ]
        }])
            .pipe(ezs('TeeftRemoveShortTerms'))
            .on('data', (data) => {
                res = res.concat(data);
            })
            .on('error', done)
            .on('end', () => {
                expect(res).toHaveLength(1);
                const { terms } = res[0];
                expect(terms).toHaveLength(7);
                done();
            });
    });

});
