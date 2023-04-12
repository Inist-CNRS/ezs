import from from 'from';
// @ts-ignore
import ezs from '../../core/src';
import ezsBasics from '../src';

ezs.use(ezsBasics);

describe('TXTInflection', () => {
    it('should return input #1', (done) => {
        let res = [];
        from([{ value: '' }])
            .pipe(ezs('TXTInflection'))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toStrictEqual([{ value: '' }]);
                done();
            });
    });
    it('should return empty', (done) => {
        let res = [];
        from([{ term: 'truc' }])
            .pipe(ezs('TXTInflection'))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toStrictEqual([{ term: 'truc', value: '' }]);
                done();
            });
    });

    it('should return input #2', (done) => {
        let res = [];
        from([{ term: 'Trucs' }])
            .pipe(ezs('TXTInflection', { path: 'term', }))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toStrictEqual([
                    { term: 'Trucs' },
                ]);
                done();
            });
    });


    it('should transfrom #1', (done) => {
        let res = [];
        from([{ term: 'Trucs' }])
            .pipe(ezs('TXTInflection', { path: 'term', transform: 'singularize' }))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toStrictEqual([
                    { term: 'Truc' },
                ]);
                done();
            });
    });

    it('should transfrom #2', (done) => {
        let res = [];
        from([{ term: 'all job' }])
            .pipe(ezs('TXTInflection', { path: 'term', transform: ['pluralize', 'capitalize', 'dasherize'] }))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toStrictEqual([
                    { term: 'All-jobs' },
                ]);
                done();
            });
    });

    it('should transfrom #2', (done) => {
        let res = [];
        from([{ term: 'loess' }])
            .pipe(ezs('TXTInflection', { path: 'term', transform: ['singularize', 'humanize'] }))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toStrictEqual([
                    { term: 'Loess' },
                ]);
                done();
            });
    });

    it('should transfrom #3', (done) => {
        let res = [];
        from([{ term: ['apples', 'sciences' ]}])
            .pipe(ezs('TXTInflection', { path: 'term', transform: ['singularize', 'humanize'] }))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toStrictEqual([
                    { term: ['Apple', 'Science' ] },
                ]);
                done();
            });
    });


});
