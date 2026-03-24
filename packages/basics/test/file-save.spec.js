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
            .pipe(ezs('FILESave', {
                identifier,
                location: '/tmp',
                compress: false,
            }))
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
    it('should return stat', (done) => {
        const output = [];
        from([1])
            .pipe(ezs('FILESave', {
                identifier,
                location: '/tmp',
                compress: false,
                jsonl: true,
            }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                expect(output.length).toBe(1);
                expect(output[0].size).toBe(2);
                expect(output[0]).toStrictEqual(
                    { filename, ...fs.statSync(filename) },
                );
                fs.unlink(filename, done);
            });
    });
});

describe('FILESave #1ter', () => {
    const identifier = Date.now();
    const filename = `/tmp/${identifier}`;
    it('should return stat', (done) => {
        const output = [];
        from([1])
            .pipe(ezs('FILESave', {
                identifier,
                location: '/tmp',
                compress: false,
                jsonl: false,
                content: 1
            }))
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

describe('FILESave with no identifier', () => {
    it('should generate random file name', (done) => {
        const output = [];
        from([1])
            .pipe(ezs('FILESave', {
                location: '/tmp',
                compress: false,
            }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                expect(output.length).toBe(1);
                expect(output[0].size).toBe(1);
                expect(output[0].filename.split('-').length).toBe(5);
                fs.unlink(output[0].filename, done);
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

describe('FILESave #3', () => {
    const identifier = Date.now();
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

describe('FILESave #4', () => {
    const identifier = Date.now();
    it('should return stat', (done) => {
        const output = [];
        from([1])
            .pipe(ezs('FILESave', {
                identifier,
                location: '/tmp',
                append: true,
                compress: false,
                jsonl: false,
                content: 1
            }))
            .pipe(ezs('FILESave', {
                identifier,
                location: '/tmp',
                append: true,
                compress: false,
                jsonl: false,
                content: 1
            }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                expect(output.length).toBe(1);
                expect(output[0].size).toBe(2);
                fs.unlink(output[0].filename, done);
            });
    });
});



describe('FILESave (delegated)', () => {
    const identifier = Date.now();
    const filename = `/tmp/${identifier}`;
    const script = `
        [FILESave]
        location = /tmp
        identifier = ${identifier}
    `;

    it('should return stat', (done) => {
        const output = [];
        from([1])
            .pipe(ezs('delegate', {
                script,
            }))
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
    const filenamegz = `/tmp/${identifier}.gz`;
    const script = `
        [FILESave]
        identifier = ${identifier}
        location = /tmp
        compress = true

        [exchange]
        value = get('filename')
        [FILELoad]
        compress = true
        location = /tmp
        `;

    it('should return the same', (done) => {
        const output = [];
        from([1])
            .pipe(ezs('delegate', { script }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                output.push(Number(chunk));
            })
            .on('end', () => {
                expect(output.length).toBe(1);
                expect(output[0]).toStrictEqual(1);
                fs.unlink(filenamegz, done);
            });
    });
});

describe('FILESave #2bis', () => {
    const identifier = Date.now();
    const filenamegz = `/tmp/${identifier}`;
    const script = `
        [TARDump]
        compress = true

        [FILESave]
        identifier = ${identifier}
        location = /tmp
        compress = false

        [exchange]
        value = get('filename')

        [FILELoad]
        compress = false
        location = /tmp

        [TARExtract]
        path = data/*.json
        compress = true
        `;

    it('should return the same', (done) => {
        const output = [];
        from(['a'])
            .pipe(ezs('delegate', { script }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                expect(output.length).toBe(1);
                expect(output[0]).toStrictEqual('a');
                fs.unlink(filenamegz, done);
            });
    });
});




describe('FILESave errors', () => {
    test('write to unauthorized files ', (done) => {
        from([1])
            .pipe(ezs('FILESave', { location: '/etc/', identifier: 'passwd'}))
            .pipe(ezs.catch())
            .on('error', () => {
                done();
            })
            .on('end', () => {
                done(new Error('Error is the right behavior'));
            });
    });
    test('write to unauthorized directory', (done) => {
        from([1])
            .pipe(ezs('FILESave', { location: '/home', identifier: 'xxxx'}))
            .pipe(ezs.catch())
            .on('error', () => {
                done();
            })
            .on('end', () => {
                done(new Error('Error is the right behavior'));
            });
    });

});
