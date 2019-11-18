import from from 'from';
import ezs from '../../core/src';
import statements from '../src';

ezs.use(statements);

describe('compareRnsr', () => {
    it('should return 1 when all rnsr are found', (done) => {
        from([{
            authors: [{
                affiliations: [{
                    address: 'GDR 2989 Université Versailles Saint-Quentin-en-Yvelines, 63009',
                    rnsr: ['200619958X'],
                    conditorRnsr: ['200619958X'],
                }],
            }],
        }])
            .pipe(ezs('compareRnsr'))
            .on('data', (data) => {
                expect(data).toBeDefined();
                expect(data).toHaveProperty('correct');
                expect(data).toHaveProperty('total');
                expect(data).toHaveProperty('recall');
                expect(data.correct).toBe(1);
                expect(data.total).toBe(1);
                expect(data.recall).toBe(1);
                done();
            });
    });

    it('should return 0.5 when half of rnsr are found in the same doc', (done) => {
        from([{
            authors: [{
                affiliations: [{
                    address: 'GDR 2989 Université Versailles Saint-Quentin-en-Yvelines, 63009',
                    rnsr: ['200619958X', 'xxxxxx'],
                    conditorRnsr: ['200619958X'],
                }],
            }],
        }])
            .pipe(ezs('compareRnsr'))
            .on('data', (data) => {
                expect(data).toEqual({
                    correct: 1,
                    total: 2,
                    recall: 0.5,
                });
                done();
            });
    });

    it('should return 0.5 when half of rnsr are found in several docs', (done) => {
        from([{
            authors: [{
                affiliations: [{
                    address: 'GDR 2989 Université Versailles Saint-Quentin-en-Yvelines, 63009',
                    rnsr: ['200619958X'],
                    conditorRnsr: ['200619958X'],
                }],
            }],
        }, {
            authors: [{
                affiliations: [{
                    address: 'univ toulouse, cnrs, lab aerol, toulouse, france',
                    rnsr: ['199512000V'],
                    conditorRnsr: [],
                }],
            }],
        }])
            .pipe(ezs('compareRnsr'))
            .on('data', (data) => {
                expect(data).toEqual({
                    correct: 1,
                    total: 2,
                    recall: 0.5,
                });
                done();
            });
    });
});
