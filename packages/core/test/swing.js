import assert from 'assert';
import from from 'from';
import Expression from '../src/expression';
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
                reverse: true,
                test: new Expression("get('a').isEqual(2)"),
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
                test: new Expression("get('a').isEqual(2)"),
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
                assert.equal(res, 495); // 5 * 99
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
                test: false,
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
                assert.equal(res, 6);
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
        const localScript = `
            [swing]
            test = get('a').isEqual(2)
            test = get('b').isEqual(9)

            [swing/assign]
            path = a
            value = 10
        `;

        let res = 0;
        from([
            { a: 1, b: 9 },
            { a: 2, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
        ])
            .pipe(ezs('delegate', {
                script: localScript,
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
                assert.equal(res, 14);
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
                test: new Expression("get('b').isEqual(9)"),
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
                test: new Expression("get('b').isEqual(9)"),
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
                test: new Expression("get('b').isEqual(9)"),
                commands,
            }))
            .pipe(ezs.catch())
            .on('error', (error) => {
                assert.ok(error instanceof Error);
                done();
            });
    });
    it('with invalid statement ter', (done) => {
        const commands = [
            {
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
                commands,
            }))
            .pipe(ezs.catch())
            .on('error', (error) => {
                assert.ok(error instanceof Error);
                done();
            });
    });

    it('with false', (done) => {
        let res = 0;
        from([
            { a: 1, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
        ])
            .pipe(ezs('swing', {
                test: false,
                script,
            }))
            .pipe(ezs.catch())
            .on('error', (err) => {
                throw err;
            })
            .on('data', (chunk) => {
                res += chunk.a;
            })
            .on('end', () => {
                assert.equal(5, res);
                done();
            });
    });


});
