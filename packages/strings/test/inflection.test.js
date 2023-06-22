import from from 'from';
// @ts-ignore
import ezs from '../../core/src';
import statements from '../src';

ezs.use(statements);

describe('inflection', () => {
    it('should return input #1', (done) => {
        let res = [];
        from([''])
            .pipe(ezs('inflection'))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toStrictEqual(['']);
                done();
            });
    });

    it('should return empty for unexisting property', (done) => {
        let res = [];
        from([{ term: 'truc' }])
            .pipe(ezs('inflection', { path: 'value' }))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toStrictEqual([{ term: 'truc', value: '' }]);
                done();
            });
    });

    it('should return input when no transform', (done) => {
        let res = [];
        from([{ term: 'Trucs' }])
            .pipe(ezs('inflection', { path: 'term' }))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toStrictEqual([{ term: 'Trucs' }]);
                done();
            });
    });

    it('should transform #1: singularize', (done) => {
        let res = [];
        from([{ term: 'Trucs' }])
            .pipe(ezs('inflection', { path: 'term', transform: 'singularize' }))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toStrictEqual([{ term: 'Truc' }]);
                done();
            });
    });

    it('should transform #2: pluralize, capitalize, dasherize', (done) => {
        let res = [];
        from([{ term: 'all job' }])
            .pipe(
                ezs('inflection', {
                    path: 'term',
                    transform: ['pluralize', 'capitalize', 'dasherize'],
                })
            )
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toStrictEqual([{ term: 'All-jobs' }]);
                done();
            });
    });

    it('should transform #2: singularize, humanize', (done) => {
        let res = [];
        from([{ term: 'loess' }])
            .pipe(
                ezs('inflection', {
                    path: 'term',
                    transform: ['singularize', 'humanize'],
                })
            )
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toStrictEqual([{ term: 'Loess' }]);
                done();
            });
    });

    it('should transform #3: singularize, humanize', (done) => {
        let res = [];
        from([{ term: ['apples', 'sciences'] }])
            .pipe(
                ezs('inflection', {
                    path: 'term',
                    transform: ['singularize', 'humanize'],
                })
            )
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toStrictEqual([{ term: ['Apple', 'Science'] }]);
                done();
            });
    });
});
