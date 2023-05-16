import assert from 'assert';
import from from 'from';
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

describe('fork)', () => {
    it('#1', (done) => {
        let res = 0;
        const script = `
            [assign]
            path = a
            value = 99
        `;
        from([
            { a: 1, b: 9 },
            { a: 2, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
        ])
            .pipe(ezs('fork', {
                script,
            }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res += chunk.a;
            })
            .on('end', () => {
                assert.equal(6, res);
                done();
            });
    });
    it('#1 (standalone)', (done) => {
        let res = 0;
        const script = `
            [assign]
            path = a
            value = 99
        `;
        from([
            { a: 1, b: 9 },
            { a: 2, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
        ])
            .pipe(ezs('fork', {
                script,
                standalone: true,
            }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res += chunk.a;
            })
            .on('end', () => {
                assert.equal(6, res);
                done();
            });
    });

    it('#2', (done) => {
        const script = `
            [boum]
        `;
        from([
            { a: 1, b: 9 },
            { a: 2, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
        ])
            .pipe(ezs('fork', {
                script,
            }))
            .pipe(ezs.catch())
            .on('error', (e) => {
                expect(e.message).toEqual(expect.stringContaining('boum'));
                done();
            })
            .on('data', () => true)
            .on('end', () => {
                done(new Error('Error is the right behavior'));
            });
    });

    it('#2 (standalone)', (done) => {
        const script = `
            [boum]
        `;
        from([
            { a: 1, b: 9 },
            { a: 2, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
        ])
            .pipe(ezs('fork', {
                script,
                standalone: true,
            }))
            .pipe(ezs.catch())
            .on('error', (e) => {
                expect(e.message).toEqual(expect.stringContaining('boum'));
                done();
            })
            .on('data', () => true)
            .on('end', () => {
                done(new Error('Error is the right behavior'));
            });
    });

    it('#3', (done) => {
        const script = `
            [aie]
        `;
        from([
            { a: 1, b: 9 },
            { a: 2, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
        ])
            .pipe(ezs('fork', {
                script,
            }))
            .pipe(ezs.catch())
            .on('error', (e) => {
                expect(e.message).toEqual(expect.stringContaining('aie!'));
                done();
            })
            .on('data', () => true)
            .on('end', () => {
                done(new Error('Error is the right behavior'));
            });
    });

    it('#3 (standalone)', (done) => {
        const script = `
            [aie]
        `;
        from([
            { a: 1, b: 9 },
            { a: 2, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
        ])
            .pipe(ezs('fork', {
                script,
                standalone: true,
            }))
            .pipe(ezs.catch())
            .on('error', (e) => {
                expect(e.message).toEqual(expect.stringContaining('aie!'));
                done();
            })
            .on('data', () => true)
            .on('end', () => {
                done(new Error('Error is the right behavior'));
            });
    });

    it('#4', (done) => {
        const script = `
            [fake]
        `;
        from([
            { a: 1, b: 9 },
            { a: 2, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
        ])
            .pipe(ezs('fork', {
                script,
            }))
            .pipe(ezs.catch())
            .on('error', (e) => {
                expect(e.message).toEqual(expect.stringContaining('fake'));
                done();
            })
            .on('data', () => true)
            .on('end', () => {
                done(new Error('Error is the right behavior'));
            });
    });

    it('#4 (standalone)', (done) => {
        const script = `
            [fake]
        `;
        from([
            { a: 1, b: 9 },
            { a: 2, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
        ])
            .pipe(ezs('fork', {
                script,
                standalone: true,
            }))
            .pipe(ezs.catch())
            .on('error', (e) => {
                expect(e.message).toEqual(expect.stringContaining('fake'));
                done();
            })
            .on('data', () => true)
            .on('end', () => {
                done(new Error('Error is the right behavior'));
            });
    });


    it('#5 (standalone)', (done) => {
        let res = 0;
        const script = `
            [slow]
            time = 10
            [assign]
            path = a
            value = 99
        `;
        from([
            { a: 1, b: 9 },
            { a: 2, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
        ])
            .pipe(ezs('fork', {
                script,
                standalone: true,
            }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res += chunk.a;
            })
            .on('end', () => {
                assert.equal(6, res);
                done();
            });
    });



});
