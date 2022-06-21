import from from 'from';
import fs from 'fs';

import ezs from '../../core/src';
import ezsBasics from '../src';

ezs.use(ezsBasics);

describe('FILESave #1', () => {
    const identifier = Date.now();
    const filename = `/tmp/${identifier}`;
    it('should return stat', (done) => {
        const output = [];
        from([1])
            .pipe(ezs('FILESave', { identifier, location: '/tmp' }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                expect(output.length).toBe(1);
                expect(output[0].size).toBe(1);
                expect(output[0]).toStrictEqual(
                    { filename, ...fs.statSync(filename) },
                );
                fs.unlink(filename, done);
            });
    });
});
describe('FILESave #2', () => {
    const identifier = Date.now();
    const filename = `/tmp/toto/${identifier}`;
    it('should return stat', (done) => {
        const output = [];
        from([1])
            .pipe(ezs('FILESave', { identifier, location: '/tmp/toto' }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                expect(output.length).toBe(1);
                expect(output[0].size).toBe(1);
                expect(output[0]).toStrictEqual(
                    { filename, ...fs.statSync(filename) },
                );
                fs.unlink(filename, done);
            });
    });
});

describe('FILESave #1bis', () => {
    const identifier = Date.now();
    const filename = `/tmp/${identifier}`;
    const filenamegz = `/tmp/${identifier}.gz`;
    it('should return stat', (done) => {
        const output = [];
        from([1])
            .pipe(ezs('FILESave', { identifier, location: '/tmp', compress: true }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                expect(output.length).toBe(1);
                expect(output[0]).toStrictEqual(
                    { filename: filenamegz, ...fs.statSync(filenamegz) },
                );
                fs.unlink(filenamegz, done);
            });
    });
});
