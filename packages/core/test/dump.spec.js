import assert from 'assert';
import from from 'from';
import ezs from '../src/index.js';

describe('dump', () => {
    it('empty input: outputs an empty string', (done) => {
        const res = [];
        from([])
            .pipe(ezs('dump'))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(res.join(''), '');
                done();
            });
    });
    it('one value: outputs [value]', (done) => {
        const res = [];
        from([1])
            .pipe(ezs('dump'))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(res.join(''), '[1]');
                done();
            });
    });
    it('several values: outputs a JSON array', (done) => {
        const res = [];
        from([1, 2, 3])
            .pipe(ezs('dump'))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(res.join(''), '[1,2,3]');
                done();
            });
    });
    it('with indent: outputs a formatted JSON array', (done) => {
        const res = [];
        from([1, 2, 3])
            .pipe(ezs('dump', { indent: true }))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(res.join(''), '[1,\n2,\n3]');
                done();
            });
    });
    it('values after error chunks: opens the array on the first value', (done) => {
        const res = [];
        from([new Error(1), 2, new Error(3)])
            .pipe(ezs('dump'))
            .on('data', (chunk) => {
                if (!(chunk instanceof Error)) {
                    res.push(chunk);
                }
            })
            .on('end', () => {
                assert.equal(res.join(''), '[2]');
                done();
            });
    });
    it('only error chunks: outputs an empty array', (done) => {
        const res = [];
        from([new Error(1), new Error(2)])
            .pipe(ezs('dump'))
            .on('data', (chunk) => {
                if (!(chunk instanceof Error)) {
                    res.push(chunk);
                }
            })
            .on('end', () => {
                assert.equal(res.join(''), '[]');
                done();
            });
    });
    it('objects: outputs a JSON array of objects', (done) => {
        const res = [];
        from([{ a: 1 }, { a: 2 }])
            .pipe(ezs('dump'))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(res.join(''), '[{"a":1},{"a":2}]');
                done();
            });
    });
});
