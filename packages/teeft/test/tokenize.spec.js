import from from 'from';
// @ts-ignore
import ezs from '../../core/src';
import statements from '../src';

ezs.use(statements);

describe('tokenize', () => {
    it('should split ascii simple words', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            sentences: ['aha blabla hehe'],
        }])
            .pipe(ezs('TeeftTokenize'))
            .on('data', (chunk) => {
                res = res.concat(chunk);
            })
            .on('end', () => {
                expect(res).toEqual([{
                    path: '/path/1',
                    sentences: [ ['aha', 'blabla', 'hehe'] ],
                }]);
                done();
            });
    });

    it('should split french simple words', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            sentences: ['ça va héhé'],
        }])
            .pipe(ezs('TeeftTokenize'))
            .on('data', (chunk) => {
                res = res.concat(chunk);
            })
            .on('end', () => {
                expect(res).toEqual([{
                    path: '/path/1',
                    sentences: [ ['ça', 'va', 'héhé'] ],
                }]);
                done();
            });
    });

    it('should remove punctuation characters', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            sentences: ['ça va, héhé!'],
        }])
            .pipe(ezs('TeeftTokenize'))
            .on('data', (chunk) => {
                res = res.concat(chunk);
            })
            .on('end', () => {
                expect(res).toEqual([{
                    path: '/path/1',
                    sentences: [ ['ça', 'va', 'héhé'] ],
                }]);
                done();
            });
    });

    it('should output as many items as sentences', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            sentences: ['ça va?', 'héhé!'],
        }])
            .pipe(ezs('TeeftTokenize'))
            .on('data', (chunk) => {
                res = res.concat(chunk);
            })
            .on('end', () => {
                expect(res).toEqual([{
                    path: '/path/1',
                    sentences: [
                        ['ça', 'va'],
                        ['héhé'],
                    ],
                }]);
                done();
            });
    });

    it('should not cut on dashes', (done) => {
        let res = [];
        from([{
            path: '/path/1',
            // WARNING: TeeftTokenize does not work well on uppercase,
            //          Use TeeftToLowerCase
            // sentences: ['Do multi-agent plate-formes use TF-IDF'],
            sentences: ['do multi-agent plate-formes use tf-idf'],
        }])
            .pipe(ezs('TeeftTokenize'))
            // .pipe(ezs('debug'))
            .on('data', (chunk) => {
                res = res.concat(chunk);
            })
            .on('end', () => {
                expect(res).toEqual([{
                    path: '/path/1',
                    sentences: [['do','multi-agent','plate-formes','use','tf-idf']],
                }]);
                done();
            })
            .on('error', done);
    });
});
