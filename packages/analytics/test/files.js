import fs from 'fs';
import assert from 'assert';
import from from 'from';
import ezs from '../../core/src';
import statements from '../src';
import basics from '../../basics/src';

ezs.addPath(__dirname);

describe('files', () => {
    test('with existing file', (done) => {
        ezs.use(statements);
        ezs.use(basics);
        const input = [
            'data01.json',
        ];
        const output = [];
        from(input)
            .pipe(ezs('files', { location: __dirname }))
            .pipe(ezs('JSONParse'))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                assert.equal(output.length, 336);
                assert.equal(output[0].id, '9.928');
                assert.equal(output[0].value, 1);
                done();
            });
    });

    test('with not existing file', (done) => {
        ezs.use(statements);
        ezs.use(basics);
        const input = [
            'XXXXX.json',
        ];
        const output = [];
        from(input)
            .pipe(ezs('files', { location: __dirname }))
            .pipe(ezs('JSONParse'))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                assert.equal(output.length, 0);
                done();
            });
    });

    test('with not authorized file', (done) => {
        ezs.use(statements);
        ezs.use(basics);
        fs.writeFileSync(`${__dirname}/forbidden`, 'secret', { mode: 0o333 });
        const input = [
            'forbidden',
        ];
        from(input)
            .pipe(ezs('files', { location: __dirname }))
            .pipe(ezs('JSONParse'))
            .pipe(ezs.catch())
            .on('error', () => {
                done();
            })
            .on('end', () => {
                done(new Error('Error is the right behavior'));
            });
    });
});
