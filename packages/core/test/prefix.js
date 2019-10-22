
import assert from 'assert';
import from from 'from';
import ezs from '../src';

describe('Build a pipeline', () => {
    it('with prefixed statement in script', (done) => {
        const script = `
            [basics:CSVParse]
        `;
        const res = [];
        from([
            'a,b,c\n',
            '1,2,3\n',
            '4,5,6\n',
        ])
            .pipe(ezs('delegate', { script }))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.strictEqual(res.length, 3);
                assert.strictEqual(res[0][0], 'a');
                assert.strictEqual(res[2][2], '6');
                done();
            });
    });

    it('with prefixed statement with code', (done) => {
        const res = [];
        from([
            'a,b,c\n',
            '1,2,3\n',
            '4,5,6\n',
        ]).pipe(ezs('basics:CSVParse'))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.strictEqual(res.length, 3);
                assert.strictEqual(res[0][0], 'a');
                assert.strictEqual(res[2][2], '6');
                done();
            });
    });
});
