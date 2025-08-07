import assert from 'assert';
import from from 'from';
import ezs from '../src';
import ezsBasics from '../../basics';

describe('load named function', () => {
    it('ezsBasics.OBJCount', (done) => {
        let res = 0;
        from([
            { a: 1, b: 9 },
            { a: 2, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
        ])
            .pipe(ezs(ezsBasics.OBJCount))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                res += chunk;
            })
            .on('end', () => {
                assert.equal(5, res);
                done();
            });
    });
    it('unknown statement', (done) => {
        from([
            { a: 1, b: 9 },
            { a: 2, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
        ])
            .pipe(ezs('unknown'))
            .pipe(ezs.catch())
            .on('error', (error) => {
                assert.ok(error instanceof Error);
                done();
            })
            .on('end', () => {
                done(new Error('unexpected behavior'));
            });

    });

    it('invalid statement #1', (done) => {
        try {
            ezs.use({ fake: false });
        } catch(error) {
            assert.ok(error instanceof Error);
            done();
        }
    });

    it('invalid statement #2', (done) => {
        try {
            ezs.use('fake');
        } catch(error) {
            assert.ok(error instanceof Error);
            done();
        }
    });


});
