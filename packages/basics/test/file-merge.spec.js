import fs from 'fs';
import assert from 'assert';
import from from 'from';
import ezs from '../../core/src';
import statements from '../src';
import basics from '../../basics/src';

ezs.addPath(__dirname);

describe('FILEMerge', () => {
    test('with existing file (buffer)', (done) => {
        ezs.use(statements);
        ezs.use(basics);
        const input = [
            'data01.json',
        ];
        const output = [];
        from(input)
            .pipe(ezs('FILELoad', { location: __dirname }))
            .pipe(ezs('FILEMerge', { location: __dirname }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                output.push(JSON.parse(String(chunk)));
            })
            .on('end', () => {
                assert.equal(output.length, 1);
                assert.equal(output[0][0].id, '9.928');
                assert.equal(output[0][0].value, 1);
                done();
            });
    });
    test('with existing file (string)', (done) => {
        ezs.use(statements);
        ezs.use(basics);
        const input = [
            'data01.json',
        ];
        const output = [];
        from(input)
            .pipe(ezs('FILELoad', { location: __dirname }))
            .pipe(ezs('TXTParse'))
            .pipe(ezs('FILEMerge', { location: __dirname }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                output.push(JSON.parse(chunk));
            })
            .on('end', () => {
                assert.equal(output.length, 1);
                assert.equal(output[0][0].id, '9.928');
                assert.equal(output[0][0].value, 1);
                done();
            });
    });
});
