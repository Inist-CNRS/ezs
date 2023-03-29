import from from 'from';
// @ts-ignore
import ezs from '../../core/src';
import ezsBasics from '../src';

ezs.use(ezsBasics);

describe('TXTSentences', () => {
    it('should return an array', (done) => {
        let res = [];
        from([{ value: '' }])
            .pipe(ezs('TXTSentences'))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toStrictEqual([{ value: [] }]);
                done();
            });
    });

    it('should generate two sentences', (done) => {
        let res = [];
        from([{ value: 'After all. These are two sentences.' }])
            .pipe(ezs('TXTSentences'))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toStrictEqual([
                    { value: ['After all.', 'These are two sentences.'] },
                ]);
                done();
            });
    });

    it('should take path parameter into account', (done) => {
        let res = [];
        from([{ other: 'After all. These are two sentences.' }])
            .pipe(ezs('TXTSentences', { path: 'other' }))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toStrictEqual([
                    { other: ['After all.', 'These are two sentences.'] },
                ]);
                done();
            });
    });

    it('should generate three sentences', (done) => {
        let res = [];
        from([{ value: 'And now. Three sentences. Indeed.' }])
            .pipe(ezs('TXTSentences'))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toStrictEqual([
                    { value: ['And now.', 'Three sentences.', 'Indeed.'] },
                ]);
                done();
            });
    });

    it('should return an empty array when input is not a string', (done) => {
        let res = [];
        from([{ value: {} }, { value: 1 }, { value: true }])
            .pipe(ezs('TXTSentences'))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toStrictEqual([
                    { value: [] },
                    { value: [] },
                    { value: [] },
                ]);
                done();
            });
    });

    it('should generate two sentences with other endings', (done) => {
        let res = [];
        from([{ value: 'Is it? It is!' }])
            .pipe(ezs('TXTSentences'))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toStrictEqual([{ value: ['Is it?', 'It is!'] }]);
                done();
            });
    });

    it('should not split initials in the middle of a sentence', (done) => {
        let res = [];
        from([{ value: 'My name is Bond, J. Bond.' }])
            .pipe(ezs('TXTSentences'))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toStrictEqual([
                    { value: ['My name is Bond, J. Bond.'] },
                ]);
                done();
            });
    });

    it('should not split initials at the beginning of a sentence', (done) => {
        let res = [];
        from([{ value: 'C. Norris, that means Chuck Norris.' }])
            .pipe(ezs('TXTSentences'))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toStrictEqual([
                    { value: ['C. Norris, that means Chuck Norris.'] },
                ]);
                done();
            });
    });

    it('should return an array already segmented', (done) => {
        let res = [];
        from([{ value: ['Sentence 1.', 'Sentence 2.'] }])
            .pipe(ezs('TXTSentences'))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toStrictEqual([
                    { value: ['Sentence 1.', 'Sentence 2.'] },
                ]);
                done();
            });
    });

    it('should segment again an array wrongly segmented', (done) => {
        let res = [];
        from([{ value: ['Sentence', '1. Sentence 2.'] }])
            .pipe(ezs('TXTSentences'))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toStrictEqual([
                    { value: ['Sentence 1.', 'Sentence 2.'] },
                ]);
                done();
            });
    });

    it.skip('should not split abbreviations in a sentence', (done) => {
        let res = [];
        from([{ value: 'Born in the U.S.A.' }])
            .pipe(ezs('TXTSentences'))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toStrictEqual([{ value: ['Born in the U.S.A.'] }]);
                done();
            });
    });

    it.skip('should not split abbreviations at the end of a sentence', (done) => {
        let res = [];
        from([{ value: 'Don\'t use T.N.T. inside buildings.' }])
            .pipe(ezs('TXTSentences'))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toStrictEqual([
                    { value: ['Don\'t use T.N.T. inside buildings.'] },
                ]);
                done();
            });
    });
});
