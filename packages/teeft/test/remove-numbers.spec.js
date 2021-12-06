import from from 'from';
// @ts-ignore
import ezs from '../../core/src';
import statements from '../src';
import { termIsNotNumber } from '../src/remove-numbers';

ezs.use(statements);

describe('termIsNotNumber', () => {
    it('should return false for 0', () => {
        expect(termIsNotNumber({ term: '0' })).toBe(false);
    });

    it('should return false for 2000', () => {
        expect(termIsNotNumber({ term: '2000' })).toBe(false);
    });

    it('should return false for 0.1', () => {
        expect(termIsNotNumber({ term: '0.1' })).toBe(false);
    });

    it('should return false for 0,1', () => {
        expect(termIsNotNumber({ term: '0,1' })).toBe(false);
    });

    it('should return false for non-numeric entries', () => {
        expect(termIsNotNumber({ term: 'non numeric string' })).toBe(true);
    });
});

describe('remove numbers', () => {
    it('should remove 1-digit number', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            terms: [
                { frequency: 78, length: 1, tag: [Array], term: '0' },
                { frequency: 4, length: 1, tag: [Array], term: 'aide' },
                { frequency: 2, length: 1, tag: [Array], term: 'expertise' },
                { frequency: 29, length: 1, tag: [Array], term: 'brevets' },
                { frequency: 1, length: 1, tag: [Array], term: 'alignement' },
                { frequency: 6, length: 1, tag: [Array], term: 'publications' },
                { frequency: 11, length: 1, tag: [Array], term: 'scientifiques' },
                { frequency: 1, length: 2, term: 'publications scientifiques' },
            ]
        }])
            .pipe(ezs('TeeftRemoveNumbers'))
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

    it('should remove 1-digit numbers', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            terms: [
                { frequency: 78, length: 1, tag: [Array], term: '0' },
                { frequency: 7, length: 1, tag: [Array], term: '2' },
                { frequency: 4, length: 1, tag: [Array], term: 'aide' },
                { frequency: 2, length: 1, tag: [Array], term: 'expertise' },
                { frequency: 29, length: 1, tag: [Array], term: 'brevets' },
                { frequency: 1, length: 1, tag: [Array], term: 'alignement' },
                { frequency: 6, length: 1, tag: [Array], term: 'publications' },
                { frequency: 11, length: 1, tag: [Array], term: 'scientifiques' },
                { frequency: 1, length: 2, term: 'publications scientifiques' },
            ]
        }])
            .pipe(ezs('TeeftRemoveNumbers'))
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

    it('should remove 4-digits numbesr', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            terms: [
                { frequency: 78, length: 1, tag: [Array], term: '2021' },
                { frequency: 4, length: 1, tag: [Array], term: 'aide' },
                { frequency: 2, length: 1, tag: [Array], term: 'expertise' },
                { frequency: 29, length: 1, tag: [Array], term: 'brevets' },
                { frequency: 1, length: 1, tag: [Array], term: 'alignement' },
                { frequency: 6, length: 1, tag: [Array], term: 'publications' },
                { frequency: 11, length: 1, tag: [Array], term: 'scientifiques' },
                { frequency: 1, length: 2, term: 'publications scientifiques' },
            ]
        }])
            .pipe(ezs('TeeftRemoveNumbers'))
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

    it('should remove floating point numbers', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            terms: [
                { frequency: 1, length: 1, tag: [Array], term: '0.4' },
                { frequency: 1, length: 1, tag: [Array], term: '0.546' },
                { frequency: 4, length: 1, tag: [Array], term: 'aide' },
                { frequency: 2, length: 1, tag: [Array], term: 'expertise' },
                { frequency: 29, length: 1, tag: [Array], term: 'brevets' },
                { frequency: 1, length: 1, tag: [Array], term: 'alignement' },
                { frequency: 6, length: 1, tag: [Array], term: 'publications' },
                { frequency: 11, length: 1, tag: [Array], term: 'scientifiques' },
                { frequency: 1, length: 2, term: 'publications scientifiques' },
            ]
        }])
            .pipe(ezs('TeeftRemoveNumbers'))
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

    it('should remove French floating point numbers', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            terms: [
                { frequency: 1, length: 1, tag: [Array], term: '0,4' },
                { frequency: 1, length: 1, tag: [Array], term: '0,546' },
                { frequency: 4, length: 1, tag: [Array], term: 'aide' },
                { frequency: 2, length: 1, tag: [Array], term: 'expertise' },
                { frequency: 29, length: 1, tag: [Array], term: 'brevets' },
                { frequency: 1, length: 1, tag: [Array], term: 'alignement' },
                { frequency: 6, length: 1, tag: [Array], term: 'publications' },
                { frequency: 11, length: 1, tag: [Array], term: 'scientifiques' },
                { frequency: 1, length: 2, term: 'publications scientifiques' },
            ]
        }])
            .pipe(ezs('TeeftRemoveNumbers'))
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
