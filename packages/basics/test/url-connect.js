import http from 'http';
import from from 'from';
import semver from 'semver';
import ezs from '../../core/src';
import ezsAnalytics from '../../analytics/src';
import statements from '../src';

ezs.addPath(__dirname);
ezs.settings.servePath = __dirname;


function pause(data, feed) {
    const time2sleep = Number(this.getParam('time', 1000));
    if (this.isLast()) {
        feed.close();
    }
    feed.write(data);
    return setTimeout(() => feed.end(), time2sleep);
}


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
                streaming: true
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
            .on('error',done)
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
                streaming: true
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
                streaming: true,
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
                    try {
                        expect(e.message).toEqual(expect.stringContaining('JSON at position'));
                        done();
                    } catch(ee) {
                        done(ee);
                    }
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
                    streaming: true,
                    json: true,
                }))
                .pipe(ezs.catch())
                .on('error', (e) => {
                    try {
                        expect(e.message).toEqual(expect.stringContaining("Invalid JSON (Unexpected \"\\r\" at position 3 in state STOP)"));
                        done();
                    } catch(ee) {
                        done(ee);
                    }
                })
                .on('data', () => {
                    done(new Error('Error is the right behavior'));
                })
                .on('end', () => {
                    done(new Error('Error is the right behavior'));
                });
        });
        test('#4ter', (done) => {
            ezs.use(statements);
            const input = ['1a', '2a', '3a', '4a', '5a'];
            from(input)
                .pipe(ezs('URLConnect', {
                    url: 'http://127.0.0.1:33331/empty.ini',
                    json: true,
                    retries: 1,
                }))
                .pipe(ezs.catch())
                .on('error', (e) => {
                    try {
                        expect(e.message).toEqual(expect.stringContaining("URL returned an empty response "));
                        done();
                    } catch(ee) {
                        done(ee);
                    }
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

describe('URLConnect error and retry', () => {
    let serverHandle1;
    let counter1 = 0;
    let counter2 = 0;
    beforeAll((ready) => {
        serverHandle1 = http.createServer((req, res) => {
            if (req.headers['x-timeout'] === 'erratic') {
                counter2 += 1;
                if (counter2 % 2 === 0) {
                    res.writeHead(500);
                    return res.end();
                }
            }
            res.writeHead(200);
            if (req.headers['x-timeout'] === 'all') {
                const timeoutHandle = setTimeout(() => {
                    req.pipe(res);
                }, 1000);
                res.on('close', () => clearTimeout(timeoutHandle));
                return req;
            }
            if (req.headers['x-timeout'] === 'none') {
                return req.pipe(res);
            }
            if (req.headers['x-timeout'] === 'once') {
                counter1 += 1;
                if (counter1 === 1) {
                    const timeoutHandle = setTimeout(() => {
                        req.pipe(res);
                    }, 1000);
                    res.on('close', () => clearTimeout(timeoutHandle));
                } else {
                    return req.pipe(res);
                }
            }
            if (req.headers['x-timeout'] === 'slow') {
                return req.pipe(ezs(pause)).pipe(res);
            }
            return req.pipe(res);
        });
        serverHandle1.listen(44441);
        serverHandle1.on('listening', () => ready());
    });
    afterAll(() => {
        serverHandle1.close();
    });

    describe('line', () => {
        const input = ['1a', '2a', '3a', '4a', '5a'];
        test('base line with no timeout', (done) => {
            ezs.use(statements);
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


        test('one retry, errors every time', (done) => {
            ezs.use(statements);
            from(input)
                .pipe(ezs('URLConnect', {
                    url: 'http://127.0.0.1:44441/',
                    json: true,
                    streaming: true,
                    timeout: 100,
                    header: 'x-timeout:all',
                }))
                .pipe(ezs.catch())
                .on('error', (e) => {
                    try {
                        expect(e.message).toEqual(expect.stringContaining('network timeout at'));
                        done();
                    } catch(ee) {
                        done(ee);
                    }
                })
                .on('end', () => {
                    done(new Error('Error is the right behavior'));
                });
        });

        test('two retry, errors every time', (done) => {
            ezs.use(statements);
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
                        expect(e.message).toEqual(expect.stringContaining('network timeout at'));
                        done();
                    } catch(ee) {
                        done(ee);
                    }
                })
                .on('end', () => {
                    done(new Error('Error is the right behavior'));
                });
        });

        test('two retry, error once time', (done) => {
            ezs.use(statements);
            const output = [];
            from(input)
                .pipe(ezs('URLConnect', {
                    url: 'http://127.0.0.1:44441/',
                    json: true,
                    retries: 2,
                    timeout: 900,
                    header: 'x-timeout:once',
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
    describe('deep', () => {
        ezs.use(ezsAnalytics);
        const getScript = (timeout, streaming, mode, retries = 2, port = 44441) => `
[use]
plugin = analytics

[expand]
path = value
size = 2

[expand/assign]
path = value
value = get('value',[]).concat(null).filter(Boolean)

[expand/exploding]

; [expand/debug]
; text = Request for
; path = value

[expand/expand]
path = value
size = 2

[expand/expand/URLConnect]
url = http://127.0.0.1:${port}
json = true
timeout = ${timeout}
streaming = ${streaming}
retries = ${retries}
noerror = false
header = x-timeout:${mode}

[expand/aggregate]
        `;
        const input = [
            {
                id: 1,
                value: ['a', 'b']
            },
            {
                id: 2,
                value: ['b', 'c', 'd']
            },
            {
                id: 3,
                value: ['d', 'e']
            },
            {
                id: 4,
                value: 'e'
            },
            {
                id: 5,
                value: ['b', 'c']
            }
        ];

        test('base line with one try', (done) => {
            const output = [];
            ezs.use(statements);
            from(input)
                .pipe(ezs('delegate', { script: getScript(500, true, 'none') }))
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

        test('base line with two try', (done) => {
            const output = [];
            ezs.use(statements);
            from(input)
                .pipe(ezs('delegate', { script: getScript(500, false, 'none') }))
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

        test('one retry, timeout errors every time', (done) => {
            ezs.use(statements);
            from(input)
                .pipe(ezs('delegate', { script: getScript(500, true, 'all') }))
                .pipe(ezs.catch())
                .on('error', (e) => {
                    try {
                        expect(e.message).toEqual(expect.stringContaining('network timeout at'));
                        done();
                    } catch(ee) {
                        done(ee);
                    }
                })
                .on('end', () => {
                    done(new Error('Error is the right behavior'));
                });
        });


        test('two retry, timeout errors every time', (done) => {
            ezs.use(statements);
            from(input)
                .pipe(ezs('delegate', { script: getScript(500, false, 'all') }))
                .pipe(ezs.catch())
                .on('error', (e) => {
                    try {
                        expect(e.message).toEqual(expect.stringContaining('network timeout at'));
                        done();
                    } catch(ee) {
                        done(ee);
                    }
                })
                .on('end', () => {
                    done(new Error('Error is the right behavior'));
                });
        });


        test('one retry, timeout error once time', (done) => {
            const output = [];
            ezs.use(statements);
            from(input)
                .pipe(ezs('delegate', { script: getScript(900, true, 'once') }))
                .pipe(ezs.catch())
                .pipe(ezs.catch())
                .on('error', done)
                .on('data', (chunk) => {
                    output.push(chunk);
                })
                .on('end', () => {
                    expect(output.length).toBe(5);
                    expect(output.sort((a, b) => (a.id > b.id ? 1 : -1))).toStrictEqual(input);
                    done();
                });
        });

        test('two retry, timeout error once time', (done) => {
            const output = [];
            ezs.use(statements);
            from(input)
                .pipe(ezs('delegate', { script: getScript(900, false, 'once') }))
                .pipe(ezs.catch())
                .pipe(ezs.catch())
                .on('error', done)
                .on('data', (chunk) => {
                    output.push(chunk);
                })
                .on('end', () => {
                    expect(output.length).toBe(5);
                    expect(output.sort((a, b) => (a.id > b.id ? 1 : -1))).toStrictEqual(input);
                    done();
                });
        });

        test('one retry, connect errors every time', (done) => {
            ezs.use(statements);
            from(input)
                .pipe(ezs('delegate', { script: getScript(500, false, 'all', 2, '11111') }))
                .pipe(ezs.catch())
                .on('error', (e) => {
                    try {
                        expect(e.message).toEqual(expect.stringContaining('reason: connect ECONNREFUSED'));
                        done();
                    } catch(ee) {
                        done(ee);
                    }
                })
                .on('end', () => {
                    done(new Error('Error is the right behavior'));
                });
        });

        test('five retry, erratic error some time', (done) => {
            // one out of two requests is rejected
            const output = [];
            ezs.use(statements);
            from(input)
                .pipe(ezs('delegate', { script: getScript(100, false, 'erratic', 5) }))
                .pipe(ezs.catch())
                .on('error', done)
                .on('data', (chunk) => {
                    output.push(chunk);
                })
                .on('end', () => {
                    expect(output.length).toBe(5);
                    expect(output.sort((a, b) => (a.id > b.id ? 1 : -1))).toStrictEqual(input);
                    done();
                });
        }, 30000);

        describe('slow connexion', () => {
            test('base line, streaming', (done) => {
                const output = [];
                ezs.use(statements);
                from(input)
                    .pipe(ezs('delegate', { script: getScript(100, true, 'slow') }))
                    .pipe(ezs.catch())
                    .on('data', (chunk) => {
                        output.push(chunk);
                    })
                    .on('end', () => {
                        expect(output.length).toBe(5);
                        expect(output.sort((a, b) => (a.id > b.id ? 1 : -1))).toStrictEqual(input);
                        done();
                    });
            }, 30000);
            test('base line, retry 5', (done) => {
                const output = [];
                ezs.use(statements);
                from(input)
                    .pipe(ezs('delegate', { script: getScript(100, true, 'slow', 5) }))
                    .pipe(ezs.catch())
                    .on('data', (chunk) => {
                        output.push(chunk);
                    })
                    .on('end', () => {
                        expect(output.length).toBe(5);
                        expect(output.sort((a, b) => (a.id > b.id ? 1 : -1))).toStrictEqual(input);
                        done();
                    });
            }, 30000);
            test('feed expire, streaming', (done) => {
                const output = [];
                ezs.use(statements);
                ezs.settings.feed.timeout = 10;
                from(input)
                    .pipe(ezs('delegate', { script: getScript(100, true, 'slow') }))
                    .pipe(ezs.catch())
                    .on('error', (e) => {
                        try {
                            expect(e.message).toEqual(expect.stringContaining('The pipe has not received any data for'));
                            done();
                        } catch(ee) {
                            done(ee);
                        }
                    })
                    .on('data', (chunk) => {
                        output.push(chunk);
                    })
                    .on('end', () => {
                        done(new Error('Error is the right behavior'));
                    });
                setImmediate(() => {
                    ezs.settings.feed.timeout = 300*1000;
                });
            }, 30000);

            test('feed expire, retry 5', (done) => {
                const output = [];
                ezs.use(statements);
                ezs.settings.feed.timeout = 10;
                from(input)
                    .pipe(ezs('delegate', { script: getScript(100, false, 'slow', 5) }))
                    .pipe(ezs.catch())
                    .on('error', (e) => {
                        try {
                            expect(e.message).toEqual(expect.stringContaining('The pipe has not received any data for'));
                            done();
                        } catch(ee) {
                            done(ee);
                        }
                    })
                    .on('data', (chunk) => {
                        output.push(chunk);
                    })
                    .on('end', () => {
                        done(new Error('Error is the right behavior'));
                    });
                setImmediate(() => {
                    ezs.settings.feed.timeout = 300*1000;
                });
            }, 30000);


        });

    });
});
