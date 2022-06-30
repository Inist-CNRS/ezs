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

describe('one loop for ', () => {
    const script = `
            [assign]
            path = a
            value = 99
        `;
    it('one loop for one item', (done) => {
        let res = 0;
        from([
            { a: 1, b: 1 },
            { a: 2, b: 1 },
            { a: 1, b: 1 },
            { a: 1, b: 1 },
            { a: 1, b: 1 },
        ])
            .pipe(ezs('loop', {
                test: new Expression("get('a').isEqual(2)"),
                script,
            }))
            .pipe(ezs.catch())
            .on('error', (err) => {
                throw err;
            })
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res += chunk.b;
            })
            .on('end', () => {
                assert.equal(6, res);
                done();
            });
    });
    it('one loop for two items', (done) => {
        let res = 0;
        from([
            { a: 1, b: 1 },
            { a: 2, b: 1 },
            { a: 1, b: 1 },
            { a: 2, b: 1 },
            { a: 1, b: 1 },
        ])
            .pipe(ezs('loop', {
                test: new Expression("get('a').isEqual(2)"),
                script,
            }))
            .pipe(ezs.catch())
            .on('error', (err) => {
                throw err;
            })
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res += chunk.b;
            })
            .on('end', () => {
                assert.equal(7, res);
                done();
            });
    });
});
describe('X loops ', () => {
    const scriptX2 = `
            [assign]
            path = a
            value = fix(self.b < 2 ? 'loop' : 'break')
            path = b
            value = fix(2)
        `;
    const scriptX99 = `
            [assign]
            path = a
            value = fix(self.b < 100 ? 'loop' : 'break')
            path = b
            value = get('b').add(1)
        `;

    it('2 loops for one item', (done) => {
        let res = 0;
        from([
            { a: 1, b: 1 },
            { a: 'loop', b: 1 },
            { a: 1, b: 1 },
            { a: 1, b: 1 },
            { a: 1, b: 1 },
        ])
            .pipe(ezs('loop', {
                test: new Expression("get('a').isEqual('loop')"),
                script: scriptX2,
            }))
            .pipe(ezs.catch())
            .on('error', (err) => {
                throw err;
            })
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res += 1;
            })
            .on('end', () => {
                assert.equal(7, res);
                done();
            });
    });
    it('100 loops for one item', (done) => {
        let res = 0;
        from([
            { a: 1, b: 1 },
            { a: 'loop', b: 1 },
            { a: 1, b: 1 },
            { a: 1, b: 1 },
            { a: 1, b: 1 },
        ])
            .pipe(ezs('loop', {
                test: new Expression("get('a').isEqual('loop')"),
                script: scriptX99,
            }))
            .pipe(ezs.catch())
            .on('error', (err) => {
                throw err;
            })
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res += 1;
            })
            .on('end', () => {
                assert.equal(105, res);
                done();
            });
    });
    it('100 loops for one item with maxDepth = 50', (done) => {
        let res = 0;
        from([
            { a: 1, b: 1 },
            { a: 'loop', b: 1 },
            { a: 1, b: 1 },
            { a: 1, b: 1 },
            { a: 1, b: 1 },
        ])
            .pipe(ezs('loop', {
                test: new Expression("get('a').isEqual('loop')"),
                script: scriptX99,
                maxDepth: 50,
            }))
            .pipe(ezs.catch())
            .on('data', (chunk) => {
                res += 1;
            })
            .on('error', (error) => {
                assert.ok(error instanceof Error);
                done();
            });
    });
});
describe('reverse test ', () => {
    const script = `
            [assign]
            path = a
            value = get('a')
            path = b
            value = true
        `;
    it('two loops for one item', (done) => {
        let res = 0;
        from([
            { a: 1, b: 1 },
            { a: 2 , b: 1 },
            { a: 1 },
            { a: 1, b: 1 },
            { a: 1, b: 1 },
        ])
            .pipe(ezs('loop', {
                reverse: true,
                test: new Expression("has('b')"),
                script,
            }))
            .pipe(ezs.catch())
            .on('error', (err) => {
                throw err;
            })
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res += 1;
            })
            .on('end', () => {
                assert.equal(6, res);
                done();
            });
    });
});

describe('special cases ', () => {
    const script = `
            [assign]
            path = a
            value = fix(self.b < 2 ? 'loop' : 'break')
            path = b
            value = fix(2)
        `;


    it('with no condition', (done) => {
        let res = 0;
        from([
            { a: 1, b: 9 },
            { a: 2, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
        ])
            .pipe(ezs('loop', {
                script,
            }))
            .pipe(ezs.catch())
            .on('error', (err) => {
                throw err;
            })
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res += 1;
            })
            .on('end', () => {
                assert.equal(res, 5);
                done();
            });
    });

    it('two paths', (done) => {
        const localScript = `
            [loop]
            test = get('a').isEqual(2)
            test = get('b').isEqual(9)

            [loop/assign]
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
                res += 1;
            })
            .on('end', () => {
                assert.equal(res, 6);
                done();
            });
    });
});

describe('error for ', () => {
    const script = `
            [assign]
            path = a
            value = get('a').append('x')
        `;

    it('no value', (done) => {
        let res = 0;
        from([
            { a: 1, b: 9 },
            { a: 2, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
        ])
            .pipe(ezs('loop', {
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
    it('buggy statement', (done) => {
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
            .pipe(ezs('loop', {
                test: new Expression("get('b').isEqual(9)"),
                commands,
            }))
            .pipe(ezs.catch())
            .on('error', (error) => {
                assert.ok(error instanceof Error);
                done();
            });
    });
    it('buggy statement bis', (done) => {
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
            .pipe(ezs('loop', {
                test: new Expression("get('b').isEqual(9)"),
                commands,
            }))
            .pipe(ezs.catch())
            .on('error', (error) => {
                assert.ok(error instanceof Error);
                done();
            });
    });
    it('buggy statement ter', (done) => {
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
            .pipe(ezs('loop', {
                test: new Expression("get('b').isEqual(9)"),
                commands,
            }))
            .pipe(ezs.catch())
            .on('error', (error) => {
                assert.ok(error instanceof Error);
                done();
            });
    });
    it('invalid statement ter', (done) => {
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
            .pipe(ezs('loop', {
                commands,
            }))
            .pipe(ezs.catch())
            .on('error', (error) => {
                assert.ok(error instanceof Error);
                done();
            });
    });
});
