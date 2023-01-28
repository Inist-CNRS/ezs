import fs from 'fs';
import assert from 'assert';
import from from 'from';
import ezs from '../../core/src';
import statements from '../src';
import basics from '../../basics/src';

ezs.addPath(__dirname);

describe('FILELoad', () => {
    test('with existing file', (done) => {
        ezs.use(statements);
        ezs.use(basics);
        const input = [
            'data01.json',
        ];
        const output = [];
        from(input)
            .pipe(ezs('FILELoad', { location: __dirname }))
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
            .pipe(ezs('FILELoad', { location: __dirname }))
            .pipe(ezs('JSONParse'))
            .pipe(ezs.catch())
            .on('error', () => {
                done();
            })
            .on('end', () => {
                done(new Error('Error is the right behavior'));
            });
    });

    test('with not authorized file #1', (done) => {
        ezs.use(statements);
        ezs.use(basics);
        fs.writeFileSync(`${__dirname}/forbidden`, 'secret', { mode: 0o333 });
        const input = [
            'forbidden',
        ];
        from(input)
            .pipe(ezs('FILELoad', { location: __dirname }))
            .pipe(ezs('JSONParse'))
            .pipe(ezs.catch())
            .on('error', () => {
                done();
            })
            .on('end', () => {
                done(new Error('Error is the right behavior'));
            });
    });

    test('with not authorized file #2', (done) => {
        ezs.use(statements);
        ezs.use(basics);
        const input = [
            'passwd',
        ];
        from(input)
            .pipe(ezs('FILELoad', { location: '/etc' }))
            .pipe(ezs('TXTParse'))
            .pipe(ezs.catch())
            .on('error', () => {
                done();
            })
            .on('end', () => {
                done(new Error('Error is the right behavior'));
            });
    });

    test('with not authorized file #3', (done) => {
        ezs.use(statements);
        ezs.use(basics);
        const input = [
            '.profile',
        ];
        from(input)
            .pipe(ezs('FILELoad', { location: process.env.HOME }))
            .pipe(ezs('TXTParse'))
            .pipe(ezs('debug'))
            .pipe(ezs.catch())
            .on('error', () => {
                done();
            })
            .on('end', () => {
                done(new Error('Error is the right behavior'));
            });
    });
});
