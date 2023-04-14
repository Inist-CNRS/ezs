import from from 'from';
// @ts-ignore
import ezs from '../../core/src';
import statements from '../src';

ezs.use(statements);

describe('remove weird terms', () => {
    it('should remove term with only non-alphanumeric characters', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            terms: [
                { frequency: 78, length: 1, tag: [], term: '-?/§µ£ø' },
                { frequency: 4, length: 1, tag: [], term: 'aide' },
                { frequency: 2, length: 1, tag: [], term: 'expertise' },
                { frequency: 29, length: 1, tag: [], term: 'brevets' },
                { frequency: 1, length: 1, tag: [], term: 'alignement' },
                { frequency: 6, length: 1, tag: [], term: 'publications' },
                { frequency: 11, length: 1, tag: [], term: 'scientifiques' },
                { frequency: 1, length: 2, term: 'publications scientifiques' },
            ]
        }])
            .pipe(ezs('TeeftRemoveWeirdTerms'))
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

    it('should remove terms with only non-alphanumeric characters', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            terms: [
                { frequency: 78, length: 1, tag: [], term: '-?/§µ£ø' },
                { frequency: 7, length: 1, tag: [], term: '²&"~#{([-|`_\\ç^@)]=}' },
                { frequency: 4, length: 1, tag: [], term: 'aide' },
                { frequency: 2, length: 1, tag: [], term: 'expertise' },
                { frequency: 29, length: 1, tag: [], term: 'brevets' },
                { frequency: 1, length: 1, tag: [], term: 'alignement' },
                { frequency: 6, length: 1, tag: [], term: 'publications' },
                { frequency: 11, length: 1, tag: [], term: 'scientifiques' },
                { frequency: 1, length: 2, term: 'publications scientifiques' },
            ]
        }])
            .pipe(ezs('TeeftRemoveWeirdTerms'))
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
                { frequency: 78, length: 1, tag: [], term: '-?/§µ£ø' },
                { frequency: 29, length: 1, tag: [], term: 'brevets' },
                { frequency: 1, length: 1, tag: [], term: 'alignement' },
                { frequency: 6, length: 1, tag: [], term: 'publications' },
                { frequency: 11, length: 1, tag: [], term: 'scientifiques' },
                { frequency: 1, length: 2, term: 'publications scientifiques' },
            ]
        }])
            .pipe(ezs('TeeftRemoveWeirdTerms'))
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
                { frequency: 78, length: 1, tag: [], term: '-?/§µ£ø' },
            ]
        }])
            .pipe(ezs('TeeftRemoveWeirdTerms'))
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

    it('should not remove real French terms', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            terms: [
                { frequency: 78, length: 1, tag: [], term: 'ébouriffé' },
                { frequency: 4, length: 1, tag: [], term: 'aidé' },
                { frequency: 2, length: 1, tag: [], term: 'expertisé' },
                { frequency: 29, length: 1, tag: [], term: 'créé' },
                { frequency: 1, length: 1, tag: [], term: 'alignement' },
                { frequency: 6, length: 1, tag: [], term: 'publications' },
                { frequency: 11, length: 1, tag: [], term: 'scientifiques' },
                { frequency: 1, length: 2, term: 'publications scientifiques' },
            ]
        }])
            .pipe(ezs('TeeftRemoveWeirdTerms'))
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

    it('should remove terms with only accented characters', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            terms: [
                { frequency: 78, length: 1, tag: [], term: 'éèçàù' },
                { frequency: 4, length: 1, tag: [], term: 'aide' },
                { frequency: 2, length: 1, tag: [], term: 'expertise' },
                { frequency: 29, length: 1, tag: [], term: 'brevets' },
                { frequency: 1, length: 1, tag: [], term: 'alignement' },
                { frequency: 6, length: 1, tag: [], term: 'publications' },
                { frequency: 11, length: 1, tag: [], term: 'scientifiques' },
                { frequency: 1, length: 2, term: 'publications scientifiques' },
            ]
        }])
            .pipe(ezs('TeeftRemoveWeirdTerms'))
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

    it('should not remove terms with a low non-alphanumeric ratio', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            terms: [
                { frequency: 78, length: 1, tag: [], term: '123&' },
                { frequency: 4, length: 1, tag: [], term: '12&é' },
                { frequency: 2, length: 1, tag: [], term: 'expertisé' },
                { frequency: 29, length: 1, tag: [], term: 'brevets' },
                { frequency: 1, length: 1, tag: [], term: 'alignement' },
                { frequency: 6, length: 1, tag: [], term: 'publications' },
                { frequency: 11, length: 1, tag: [], term: 'scientifiques' },
                { frequency: 1, length: 2, term: 'publications scientifiques' },
            ]
        }])
            .pipe(ezs('TeeftRemoveWeirdTerms'))
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

    it('should remove terms with a high non-alphanumeric ratio', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            terms: [
                { frequency: 78, length: 1, tag: [], term: '1&é~' },
                { frequency: 4, length: 1, tag: [], term: '1234&é~"{(' },
                { frequency: 2, length: 1, tag: [], term: 'expertisé' },
                { frequency: 29, length: 1, tag: [], term: 'brevets' },
                { frequency: 1, length: 1, tag: [], term: 'alignement' },
                { frequency: 6, length: 1, tag: [], term: 'publications' },
                { frequency: 11, length: 1, tag: [], term: 'scientifiques' },
                { frequency: 1, length: 2, term: 'publications scientifiques' },
            ]
        }])
            .pipe(ezs('TeeftRemoveWeirdTerms'))
            .on('data', (data) => {
                res = res.concat(data);
            })
            .on('error', done)
            .on('end', () => {
                expect(res).toHaveLength(1);
                const { terms } = res[0];
                expect(terms).toHaveLength(6);
                done();
            });
    });

    it('should remove term too much spaces', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            terms: [
                { frequency: 78, length: 1, tag: [], term: ' a b     c ?' },
                { frequency: 4, length: 1, tag: [], term: 'aide' },
                { frequency: 2, length: 1, tag: [], term: 'expertise' },
                { frequency: 29, length: 1, tag: [], term: 'brevets' },
                { frequency: 1, length: 1, tag: [], term: 'alignement' },
                { frequency: 6, length: 1, tag: [], term: 'publications' },
                { frequency: 11, length: 1, tag: [], term: 'scientifiques' },
                { frequency: 1, length: 2, term: 'publications scientifiques' },
            ]
        }])
            .pipe(ezs('TeeftRemoveWeirdTerms'))
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
