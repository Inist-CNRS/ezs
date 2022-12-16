import http from 'http';
import from from 'from';
import semver from 'semver';
import ezs from '../../core/src';
import statements from '../src';

ezs.addPath(__dirname);
ezs.settings.servePath = __dirname;

describe('URLConnect', () => {
    let serverHandle;
    beforeAll((ready) => {
        serverHandle = ezs.createServer(33331, __dirname);
        serverHandle.on('listening', () => ready());
    });
    afterAll(() => {
        serverHandle.close();
    });
    test('#1', (done) => {
        ezs.use(statements);
        const input = [1, 2, 3, 4, 5];
        const output = [];
        from(input)
            .pipe(ezs('URLConnect', {
                url: 'http://127.0.0.1:33331/transit.ini',
                timeout: 5000,
            }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                expect(output.length).toBe(5);
                expect(output).toStrictEqual(input);
                done();
            });
    });
    test('#1bis', (done) => {
        ezs.use(statements);
        const size = 100;
        const input = Array(size).fill(true);
        const output = [];
        from(input)
            .pipe(ezs('URLConnect', {
                url: 'http://127.0.0.1:33331/transit.ini',
                timeout: 5000,
            }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                expect(output.length).toBe(size);
                done();
            });
    }, 10000);
    test('#1ter', (done) => {
        ezs.use(statements);
        const input = [1, 2, 3, 4, 5];
        const output = [];
        from(input)
            .pipe(ezs('URLConnect', {
                url: 'http://127.0.0.1:33331/transit.ini',
                timeout: 5000,
                retries: 1, // use stream
            }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                expect(output.length).toBe(5);
                expect(output).toStrictEqual(input);
                done();
            });
    });
    test('#2', (done) => {
        ezs.use(statements);
        const input = [1, 2, 3, 4, 5];
        const output = [];
        from(input)
            .pipe(ezs('URLConnect', {
                url: 'http://127.0.0.1:33331/transit.ini',
                json: false,
                timeout: 'fakevalue', // for test
            }))
            .pipe(ezs('JSONParse'))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                expect(output.length).toBe(5);
                expect(output).toStrictEqual(input);
                done();
            });
    });
    test('#3', (done) => {
        ezs.use(statements);
        const input = [1, 2, 3, 4, 5];
        from(input)
            .pipe(ezs('URLConnect', {
                url: 'http://127.0.0.1:33331/nofound.ini',
                retries: 1,
            }))
            .pipe(ezs.catch())
            .on('error', (e) => {
                expect(() => {
                    throw e.sourceError;
                }).toThrow('Received status code 404 (Not Found)');
                done();
            })
            .on('end', () => {
                done(new Error('Error is the right behavior'));
            });
    });
    test('#3bis', (done) => {
        ezs.use(statements);
        const input = [1, 2, 3, 4, 5];
        from(input)
            .pipe(ezs('URLConnect', {
                url: 'http://127.0.0.1:33331/nofound.ini',
                retries: 2,
            }))
            .pipe(ezs.catch())
            .on('error', (e) => {
                expect(() => {
                    throw e.sourceError;
                }).toThrow('Received status code 404 (Not Found)');
                done();
            })
            .on('end', () => {
                done(new Error('Error is the right behavior'));
            });
    });
    test('#3.1', (done) => {
        ezs.use(statements);
        const input = [1, 2, 3, 4, 5];
        const output = [];
        from(input)
            .pipe(ezs('URLConnect', {
                url: 'http://127.0.0.1:33331/nofound.ini',
                retries: 1,
                noerror: true,
            }))
            .pipe(ezs.catch())
            .on('error', () => {
                done(new Error('Error should be ignored'));
            })
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                expect(output.length).toBe(0);
                done();
            });
    });
    test('#3.1bis', (done) => {
        ezs.use(statements);
        const input = [1, 2, 3, 4, 5];
        const output = [];
        from(input)
            .pipe(ezs('URLConnect', {
                url: 'http://127.0.0.1:33331/nofound.ini',
                retries: 2,
                noerror: true,
            }))
            .pipe(ezs.catch())
            .on('error', () => {
                done(new Error('Error should be ignored'));
            })
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                expect(output.length).toBe(0);
                done();
            });
    });
    if (semver.gte(process.version, '14.0.0')) {
        test('#4', (done) => {
            ezs.use(statements);
            const input = ['1a', '2a', '3a', '4a', '5a'];
            from(input)
                .pipe(ezs('URLConnect', {
                    url: 'http://127.0.0.1:33331/tocsv.ini',
                    retries: 2,
                    json: true,
                }))
                .pipe(ezs.catch())
                .on('error', (e) => {
                    expect(() => {
                        throw e.sourceError;
                    }).toThrow("Invalid JSON (Unexpected \"\\r\" at position 3 in state STOP)");
                    done();
                })
                .on('data', () => {
                    done(new Error('Error is the right behavior'));
                })
                .on('end', () => {
                    done(new Error('Error is the right behavior'));
                });
        });
        test('#4bis', (done) => {
            ezs.use(statements);
            const input = ['1a', '2a', '3a', '4a', '5a'];
            from(input)
                .pipe(ezs('URLConnect', {
                    url: 'http://127.0.0.1:33331/tocsv.ini',
                    retries: 1,
                    json: true,
                }))
                .pipe(ezs.catch())
                .on('error', (e) => {
                    expect(() => {
                        throw e.sourceError;
                    }).toThrow("Invalid JSON (Unexpected \"\\r\" at position 3 in state STOP)");
                    done();
                })
                .on('data', () => {
                    done(new Error('Error is the right behavior'));
                })
                .on('end', () => {
                    done(new Error('Error is the right behavior'));
                });
        });
    }
    test('#5', (done) => {
        ezs.use(statements);
        const input = ['1a', '2a', '3a', '4a', '5a'];
        from(input)
            .pipe(ezs('URLConnect', {
                url: 'http://127.0.0.1:11111/',
                json: true,
                retries: 2,
            }))
            .pipe(ezs.catch())
            .on('error', (e) => {
                expect(() => {
                    throw e.sourceError;
                }).toThrow('request to http://127.0.0.1:11111/ failed, reason: connect ECONNREFUSED 127.0.0.1:11111');
                done();
            })
            .on('end', () => {
                done(new Error('Error is the right behavior'));
            });
    }, 10000);
    test('#5bis', (done) => {
        ezs.use(statements);
        const input = ['1a', '2a', '3a', '4a', '5a'];
        from(input)
            .pipe(ezs('URLConnect', {
                url: 'http://127.0.0.1:11111/',
                json: true,
                retries: 1,
            }))
            .pipe(ezs.catch())
            .on('error', (e) => {
                expect(() => {
                    throw e.sourceError;
                }).toThrow('request to http://127.0.0.1:11111/ failed, reason: connect ECONNREFUSED 127.0.0.1:11111');
                done();
            })
            .on('end', () => {
                done(new Error('Error is the right behavior'));
            });
    }, 10000);
});

describe('URLConnect (BIS)', () => {
    let serverHandle1;
    let counter = 0;
    beforeAll((ready) => {
        serverHandle1 = http.createServer((req, res) => {
            res.writeHead(200);
            if (req.headers['x-timeout'] === 'all') {
                const timeoutHandle = setTimeout(() => {
                    req.pipe(res);
                }, 1000);
                res.on('close', () => clearTimeout(timeoutHandle));
            }
            if (req.headers['x-timeout'] === 'none') {
                req.pipe(res);
            }
            if (req.headers['x-timeout'] === 'first') {
                counter += 1;
                if (counter === 1) {
                    const timeoutHandle = setTimeout(() => {
                        req.pipe(res);
                    }, 1000);
                    res.on('close', () => clearTimeout(timeoutHandle));
                } else {
                    req.pipe(res);
                }
            }
        });
        serverHandle1.listen(44441);
        serverHandle1.on('listening', () => ready());
    });
    afterAll(() => {
        serverHandle1.close();
    });

    test('timeout #0', (done) => {
        ezs.use(statements);
        const input = ['1a', '2a', '3a', '4a', '5a'];
        const output = [];
        from(input)
            .pipe(ezs('URLConnect', {
                url: 'http://127.0.0.1:44441/',
                json: true,
                header: 'x-timeout:none',
            }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                expect(output.length).toBe(5);
                done();
            });
    });


    test('timeout #1', (done) => {
        ezs.use(statements);
        const input = ['1a', '2a', '3a', '4a', '5a'];
        from(input)
            .pipe(ezs('URLConnect', {
                url: 'http://127.0.0.1:44441/',
                json: true,
                retries: 1,
                timeout: 100,
                header: 'x-timeout:all',
            }))
            .pipe(ezs.catch())
            .on('error', (e) => {
                try {
                    expect(e.message).toEqual(expect.stringContaining('timeout'));
                    done();
                } catch(ee) {
                    done(ee);
                }
            })
            .on('end', () => {
                done(new Error('Error is the right behavior'));
            });
    });

    test('timeout #2', (done) => {
        ezs.use(statements);
        const input = ['1a', '2a', '3a', '4a', '5a'];
        from(input)
            .pipe(ezs('URLConnect', {
                url: 'http://127.0.0.1:44441/',
                json: true,
                retries: 2,
                timeout: 100,
                header: 'x-timeout:all',
            }))
            .pipe(ezs.catch())
            .on('error', (e) => {
                try {
                    expect(e.message).toEqual(expect.stringContaining('timeout'));
                    done();
                } catch(ee) {
                    done(ee);
                }
            })
            .on('end', () => {
                done(new Error('Error is the right behavior'));
            });
    });

    test('timeout #4', (done) => {
        ezs.use(statements);
        const input = ['1a', '2a', '3a', '4a', '5a'];
        const output = [];
        from(input)
            .pipe(ezs('URLConnect', {
                url: 'http://127.0.0.1:44441/',
                json: true,
                retries: 2,
                timeout: 900,
                header: 'x-timeout:first',
            }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                expect(output.length).toBe(5);
                done();
            });
    });


    test.skip('timeout #5', (done) => {
        ezs.use(statements);
        const input = [
            {
                value: ['a', 'b']
            },
            {
                value: ['b', 'c', 'd']
            },
            {
                value: ['d']
            }
        ];
        const output = [];
        from(input)
            .pipe(ezs('URLConnect', {
                url: 'http://127.0.0.1:44441/',
                json: true,
                retries: 2,
                timeout: 900,
                header: 'x-timeout:first',
            }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                expect(output.length).toBe(5);
                done();
            });
    });



});

