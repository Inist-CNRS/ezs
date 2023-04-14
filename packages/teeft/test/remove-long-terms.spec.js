import from from 'from';
// @ts-ignore
import ezs from '../../core/src';
import statements from '../src';

ezs.use(statements);

describe('remove long terms', () => {
    it('should not remove 50-character long terms', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            terms: [
                { frequency: 78, length: 1, tag: [], term: 'this very long term should really be removed 67890' },
                { frequency: 4, length: 1, tag: [], term: 'aide' },
                { frequency: 2, length: 1, tag: [], term: 'expertise' },
                { frequency: 29, length: 1, tag: [], term: 'brevets' },
                { frequency: 1, length: 1, tag: [], term: 'alignement' },
                { frequency: 6, length: 1, tag: [], term: 'publications' },
                { frequency: 11, length: 1, tag: [], term: 'scientifiques' },
                { frequency: 1, length: 2, term: 'publications scientifiques' },
            ]
        }])
            .pipe(ezs('TeeftRemoveLongTerms'))
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

    it('should remove 51-character long terms', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            terms: [
                { frequency: 78, length: 1, tag: [], term: 'this very long term should really be removed 678901' },
                { frequency: 4, length: 1, tag: [], term: 'aide' },
                { frequency: 2, length: 1, tag: [], term: 'expertise' },
                { frequency: 29, length: 1, tag: [], term: 'brevets' },
                { frequency: 1, length: 1, tag: [], term: 'alignement' },
                { frequency: 6, length: 1, tag: [], term: 'publications' },
                { frequency: 11, length: 1, tag: [], term: 'scientifiques' },
                { frequency: 1, length: 2, term: 'publications scientifiques' },
            ]
        }])
            .pipe(ezs('TeeftRemoveLongTerms'))
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

    it('should remove 51-character long terms', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            terms: [
                { frequency: 78, length: 1, tag: [], term: 'this very long term should really be removed 678901' },
                { frequency: 78, length: 1, tag: [], term: 'this second very long term should really be removed' },
                { frequency: 4, length: 1, tag: [], term: 'aide' },
                { frequency: 2, length: 1, tag: [], term: 'expertise' },
                { frequency: 29, length: 1, tag: [], term: 'brevets' },
                { frequency: 1, length: 1, tag: [], term: 'alignement' },
                { frequency: 6, length: 1, tag: [], term: 'publications' },
                { frequency: 11, length: 1, tag: [], term: 'scientifiques' },
                { frequency: 1, length: 2, term: 'publications scientifiques' },
            ]
        }])
            .pipe(ezs('TeeftRemoveLongTerms'))
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

    it('should remove 51-character long term not at the beginning', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            terms: [
                { frequency: 4, length: 1, tag: [], term: 'aide' },
                { frequency: 2, length: 1, tag: [], term: 'expertise' },
                { frequency: 78, length: 1, tag: [], term: 'this very long term should really be removed 678901' },
                { frequency: 29, length: 1, tag: [], term: 'brevets' },
                { frequency: 1, length: 1, tag: [], term: 'alignement' },
                { frequency: 6, length: 1, tag: [], term: 'publications' },
                { frequency: 11, length: 1, tag: [], term: 'scientifiques' },
                { frequency: 1, length: 2, term: 'publications scientifiques' },
            ]
        }])
            .pipe(ezs('TeeftRemoveLongTerms'))
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

    it('should remove 51-character long term at the end', (done) => {
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
                { frequency: 78, length: 1, tag: [], term: 'this very long term should really be removed 678901' },
            ]
        }])
            .pipe(ezs('TeeftRemoveLongTerms'))
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

    it('should remove terms longer than 51 characters', (done) => {
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
                { frequency: 78, length: 1, tag: [], term: 'this very long term should really be removed 6789012345' },
            ]
        }])
            .pipe(ezs('TeeftRemoveLongTerms'))
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
