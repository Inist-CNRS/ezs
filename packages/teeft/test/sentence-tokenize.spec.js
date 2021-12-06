import from from 'from';
// @ts-ignore
import ezs from '../../core/src';
import statements from '../src';

ezs.use(statements);

describe('sentence-tokenize', () => {
    it('should correctly segment sentences', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            content: 'Je ne suis pas sûr. Il faut un tableau.',
        }])
            .pipe(ezs('TeeftSentenceTokenize'))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                res = res.concat(chunk);
            })
            .on('end', () => {
                expect(res).toEqual([{
                    path: '/path/1',
                    sentences: ['Je ne suis pas sûr.', 'Il faut un tableau.']
                }]);
                done();
            });
    });

    it('should correctly segment sentences in several strings', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            content: 'Il faut un tableau.',
        }, {
            path: '/path/2',
            content: 'Et ça j\'en suis sûr. Maintenant!',
        }])
            .pipe(ezs('TeeftSentenceTokenize'))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                res = res.concat(chunk);
            })
            .on('end', () => {
                expect(res).toEqual([
                    {
                        path: '/path/1',
                        sentences: ['Il faut un tableau.'],
                    }, {
                        path: '/path/2',
                        sentences: [
                            'Et ça j\'en suis sûr.',
                            'Maintenant!',
                        ],
                    }
                ]);
                done();
            });
    });

    it('should work with empty sentences', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            content: '',
        }, {
            path: '/path/2',
            content: 'Et ça j\'en suis sûr. Maintenant!',
        }])
            .pipe(ezs('TeeftSentenceTokenize'))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                res = res.concat(chunk);
            })
            .on('end', () => {
                expect(res).toEqual([
                    {
                        path: '/path/1',
                        sentences: [],
                    }, {
                        path: '/path/2',
                        sentences: [
                            'Et ça j\'en suis sûr.',
                            'Maintenant!',
                        ]
                    }
                ]);
                done();
            });
    });

    it('should work with fake sentences', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            content: '.',
        }, {
            path: '/path/2',
            content: '?',
        }])
            .pipe(ezs('TeeftSentenceTokenize'))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                res = res.concat(chunk);
            })
            .on('end', () => {
                expect(res).toEqual([{
                    path: '/path/1',
                    sentences: ['.'],
                }, {
                    path: '/path/2',
                    sentences: ['?'],
                }]);
                done();
            });
    });
});