import fs from 'fs';
import assert from 'assert';
import from from 'from';
import ezs from '../../core/src';
import statements from '../src';
import basics from '../../basics/src';

ezs.addPath(__dirname);

describe('upload', () => {
    test('simple upload', (done) => {
        ezs.use(statements);
        ezs.use(basics);
        const input = [1, 2, 3];
        const output = [];
        from(input)
            .pipe(ezs('upload', { cleanupDelay: 1 }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                assert.equal(output.length, 1);
                assert.equal(output[0].value, 3);
                assert(fs.existsSync(output[0].id));
                setTimeout(() => {
                    assert(!fs.existsSync(output[0].id));
                    done();
                }, 3000);
            });
    });
});
