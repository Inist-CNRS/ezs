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
                assert(typeof chunk['x-request-id'] === 'string');
                res += chunk.a;
            })
            .on('end', () => {
                assert.equal(6, res);
                done();
            });
    });
    it('#1bis (standalone)', (done) => {
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
                target: false,
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
    it('#1ter(standalone)', (done) => {
        let res = 0;
        const script = `
            [assign]
            path = a
            value = 99
        `;
        from([
            1,
            2,
            3,
            4,
            5,
        ])
            .pipe(ezs('fork', {
                script,
                standalone: true,
                target: true,
            }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                res += Number(chunk);
            })
            .on('end', () => {
                assert.equal(15, res);
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
        // en mode standalone, l'erreur ne peut plus être renvoyée dans le flux principal
        // elle est ignorée
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
            .on('error', done)
            .on('data', () => true)
            .on('end', done);
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
        // en mode standalone, l'erreur ne peut plus être renvoyée dans le flux principal
        // elle est ignorée
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
            .on('error', done)
            .on('data', () => true)
            .on('end', () => done());
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



    it('#6 (trap)', (done) => {
        const script = `
            [aie]
        `;
        const env = {
            trap: false,
        };
        from([
            { a: 1, b: 9 },
            { a: 2, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
        ])
            .pipe(ezs(
                'fork',
                {
                    script,
                    logger: './trap.ini',
                },
                env,
            ))
            .pipe(ezs.catch())
            .on('error', (e) => {
                expect(e.message).toEqual(expect.stringContaining('aie'));
                // attendre que l'erreur dans le "fork" tombe dans le piége
                setTimeout(
                    () => {
                        expect(env.trap).toEqual(true);
                        expect(env.message).toEqual(expect.stringContaining('aie'));
                        done();
                    },
                    500,
                );
            })
            .on('data', () => true)
            .on('end', () => {
                done(new Error('Error is the right behavior'));
            });
    });


    it('#6 (trap & standalone)', (done) => {
        const script = `
            [aie]
        `;
        const env = {
            trap: false,
        };
        // attendre que l'erreur dans le "fork" tombe dans le piége
        setTimeout(
            () => {
                expect(env.trap).toEqual(true);
                expect(env.message).toEqual(expect.stringContaining('aie'));
                done();
            },
            500,
        );

        from([
            { a: 1, b: 9 },
            { a: 2, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
        ])
            .pipe(ezs(
                'fork',
                {
                    script,
                    standalone: true,
                    logger: './trap.ini',
                },
                env,
            ))
            .pipe(ezs.catch())
            .on('error', (e) => done(e))
            .on('data', () => true)
            .on('end', () => true);
    });

    it('#7 (trap & standalone)', (done) => {
        const script = `
            [slow]
            time = 100
            [boum]
        `;
        const env = {
            trap: false,
        };
        // attendre que l'erreur dans le "fork" tombe dans le piége
        setTimeout(
            () => {
                expect(env.trap).toEqual(true);
                expect(env.message).toEqual(expect.stringContaining('Boum!'));
                done();
            },
            1000,
        );
        from([
            { a: 1, b: 9 },
            { a: 2, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
        ])
            .pipe(ezs(
                'fork', {
                    script,
                    standalone: true,
                    logger: './trap.ini',
                },
                env,
            ))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', () => true)
            .on('end', () => true)
        ;
    });

    it('#8 (wrong trap & standalone)', (done) => {
        const script = `
            [slow]
            time = 100
            [boum]
        `;
        const env = {
            trap: false,
        };
        // attendre que l'erreur dans le "fork" tombe dans le piége
        setTimeout(
            () => {
                expect(env.trap).toEqual(false);
                done();
            },
            1000,
        );
        from([
            { a: 1, b: 9 },
            { a: 2, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
        ])
            .pipe(ezs(
                'fork', {
                    script,
                    standalone: true,
                    logger: './trap.ini',
                },
                env,
            ))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', () => true)
            .on('end', () => true)
        ;
    });





    it('#9 (trap & standalone &empty)', (done) => {
        const script = `
            [transit]

            [remove]
            test = get('a').isInteger()

        `;
        const env = {
            trap: false,
        };
        // attendre que l'erreur dans le "fork" tombe dans le piége
        setTimeout(
            () => {
                expect(env.trap).toEqual(true);
                expect(env.message).toEqual(expect.stringContaining('No data'));
                done();
            },
            1000,
        );
        from([
            { a: 1, b: 9 },
            { a: 2, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
            { a: 1, b: 9 },
        ])
            .pipe(ezs(
                'fork', {
                    script,
                    standalone: true,
                    logger: './trap.ini',
                },
                env,
            ))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', () => true)
            .on('end', () => true)
        ;
    });





});
