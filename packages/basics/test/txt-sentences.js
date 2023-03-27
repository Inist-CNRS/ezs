import from from 'from';
import ezs from '../../core/src';
import ezsBasics from '../src';

ezs.use(ezsBasics);

describe('TXTSentences', () => {
    it('should return an array', (done) => {
        from([''])
            .pipe(ezs('TXTSentences'))
            .on('data', (data) => {
                expect(Array.isArray(data)).toBe(true);
                expect(data).toStrictEqual([]);
            })
            .on('end', () => {
                done();
            });
    });

    it('should generate two sentences', (done) => {
        let res = [];
        from(['After all. These are two sentences.'])
            .pipe(ezs('TXTSentences'))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toStrictEqual(['After all.', 'These are two sentences.']);
                done();
            });
    });

    it('should return an empty array when input is not a string', (done) => {
        let res = [];
        from([{}])
            .pipe(ezs('TXTSentences'))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toStrictEqual([]);
                done();
            });
    });

    it('should generate two values from a Buffer', (done) => {
        let res = [];
        from([Buffer.from('Sentence 1. Sentence 2.')])
            .pipe(ezs('TXTSentences'))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toStrictEqual(['Sentence 1.', 'Sentence 2.']);
                done();
            });
    });

    it('should generate from several chunks', (done) => {
        let res = [];
        from(['Senten', 'ce 1. Sent', 'ence 2.'])
            .pipe(ezs('TXTSentences'))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toStrictEqual(['Sentence 1.', 'Sentence 2.']);
                done();
            });
    });

    it('should generate two sentences with other endings', (done) => {
        let res = [];
        from(['Is it? It is!'])
            .pipe(ezs('TXTSentences'))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toStrictEqual(['Is it?', 'It is!']);
                done();
            });
    });

    it('should not split initials in the middle of a sentence', (done) => {
        let res = [];
        from(['My name is Bond, J. Bond.'])
            .pipe(ezs('TXTSentences'))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toStrictEqual(['My name is Bond, J. Bond.']);
                done();
            });
    });

    it('should not split initials at the beginning of a sentence', (done) => {
        let res = [];
        from(['C. Norris, that means Chuck Norris.'])
            .pipe(ezs('TXTSentences'))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toStrictEqual(['C. Norris, that means Chuck Norris.']);
                done();
            });
    });

    it.skip('should not split abbreviations in a sentence', (done) => {
        let res = [];
        from(['Born in the U.S.A.'])
            .pipe(ezs('TXTSentences'))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toStrictEqual(['Born in the U.S.A.']);
                done();
            });
    });

    it.skip('should not split abbreviations at the end of a sentence', (done) => {
        let res = [];
        from(['Don\'t use T.N.T. inside buildings.'])
            .pipe(ezs('TXTSentences'))
            .on('data', (data) => {
                res = [...res, data];
            })
            .on('end', () => {
                expect(res).toStrictEqual(['Don\'t use T.N.T. inside buildings.']);
                done();
            });
    });
});
