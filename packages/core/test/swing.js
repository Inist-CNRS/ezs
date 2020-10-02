import assert from 'assert';
import from from 'from';
import { Readable } from 'stream';
import ezs from '../src';

ezs.use(require('./locals'));

ezs.addPath(__dirname);

ezs.settings.servePath = __dirname;

beforeAll(() => {
    ezs.settings.cacheEnable = true;
});
afterAll(() => {
    ezs.settings.cacheEnable = false;
});

describe('swing through file(s)', () => {
    const script = `
            [assign]
            path = a
            value = 99
        `;
    it('with not equal', (done) => {
        let res = 0;
        from([
            { a: 1, b: 9 },
            { a: 2, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
        ])
            .pipe(ezs('swing', {
                path: 'a',
                test: 'not equal',
                value: 2,
                script,
            }))
            .pipe(ezs.catch())
            .on('error', (err) => {
                throw err;
            })
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res += chunk.a;
            })
            .on('end', () => {
                assert.equal(398, res);
                done();
            });
    });
    it('with equal', (done) => {
        let res = 0;
        from([
            { a: 1, b: 9 },
            { a: 2, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
        ])
            .pipe(ezs('swing', {
                path: 'a',
                test: 'equal',
                value: 2,
                script,
            }))
            .pipe(ezs.catch())
            .on('error', (err) => {
                throw err;
            })
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res += chunk.a;
            })
            .on('end', () => {
                assert.equal(103, res);
                done();
            });
    });
    it('with no condition', (done) => {
        let res = 0;
        from([
            { a: 1, b: 9 },
            { a: 2, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
        ])
            .pipe(ezs('swing', {
                path: 'a',
                value: 2,
                script,
            }))
            .pipe(ezs.catch())
            .on('error', (err) => {
                throw err;
            })
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res += chunk.a;
            })
            .on('end', () => {
                assert.equal(103, res);
                done();
            });
    });
    it('with no value', (done) => {
        let res = 0;
        from([
            { a: 1, b: 9 },
            { a: 2, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
        ])
            .pipe(ezs('swing', {
                path: 'a',
                script,
            }))
            .pipe(ezs.catch())
            .on('error', (err) => {
                throw err;
            })
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res += chunk.a;
            })
            .on('end', () => {
                assert.equal(6, res);
                done();
            });
    });
    it('with no path', (done) => {
        let res = 0;
        from([
            { a: 1, b: 9 },
            { a: 2, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
        ])
            .pipe(ezs('swing', {
                script,
            }))
            .pipe(ezs.catch())
            .on('error', (err) => {
                throw err;
            })
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res += chunk.a;
            })
            .on('end', () => {
                assert.equal(495, res);
                done();
            });
    });
    it('with two paths', (done) => {
        let res = 0;
        from([
            { a: 1, b: 9 },
            { a: 2, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
        ])
            .pipe(ezs('swing', {
                path: ['a', 'b'],
                value: [2, 9],
                script,
            }))
            .pipe(ezs.catch())
            .on('error', (err) => {
                throw err;
            })
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res += chunk.a;
            })
            .on('end', () => {
                assert.equal(103, res);
                done();
            });
    });
    it('with two paths but one value', (done) => {
        let res = 0;
        from([
            { a: 1, b: 9 },
            { a: 2, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
        ])
            .pipe(ezs('swing', {
                path: ['a', 'b'],
                value: [2],
                script,
            }))
            .pipe(ezs.catch())
            .on('error', (err) => {
                throw err;
            })
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res += chunk.a;
            })
            .on('end', () => {
                assert.equal(6, res);
                done();
            });
    });
    it('with buggy statement', (done) => {
        const commands = [
            {
                name: 'boum',
                args: {
                    step: 2,
                },
            },
        ];
        from([
            { a: 1, b: 9 },
            { a: 2, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
        ])
            .pipe(ezs('swing', {
                path: 'b',
                value: 9,
                commands,
            }))
            .pipe(ezs.catch())
            .on('error', (error) => {
                assert.ok(error instanceof Error);
                done();
            });
    });
    it('with buggy statement bis', (done) => {
        const commands = [
            {
                name: 'bang',
                args: {
                    step: 2,
                },
            },
        ];
        from([
            { a: 1, b: 9 },
            { a: 2, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
        ])
            .pipe(ezs('swing', {
                path: 'b',
                value: 9,
                commands,
            }))
            .pipe(ezs.catch())
            .on('error', (error) => {
                assert.ok(error instanceof Error);
                done();
            });
    });
    it('with buggy statement ter', (done) => {
        const commands = [
            {
                name: 'plouf',
                args: {
                    step: 2,
                },
            },
        ];
        from([
            { a: 1, b: 9 },
            { a: 2, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
        ])
            .pipe(ezs('swing', {
                path: 'b',
                value: 9,
                commands,
            }))
            .pipe(ezs.catch())
            .on('error', (error) => {
                assert.ok(error instanceof Error);
                done();
            });
    });
});
