import http from 'http';
import from from 'from';
import semver from 'semver';
import ezs from '../../core/src';
import ezsAnalytics from '../../analytics/src';
import statements from '../src';
import { startEZSServer, stopEZSServer, getEZSHost } from './fake-ezs-server.js';
import { startServer, stopServer, getHost } from './fake-server.js';

ezs.addPath(__dirname);
ezs.settings.servePath = __dirname;


beforeAll(async () => {
    await startEZSServer(1);
    await startServer(1);
});

afterAll(async () => {
    await stopEZSServer(1);
    await stopServer(1);
});



describe('URLConnect', () => {
    test('#1', (done) => {
        ezs.use(statements);
        const input = [1, 2, 3, 4, 5];
        const output = [];
        from(input)
            .pipe(ezs('URLConnect', {
                url: `${getEZSHost(1)}/transit.ini`,
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
    }, 30000);
    test('#1bis', (done) => {
        ezs.use(statements);
        const size = 100;
        const input = Array(size).fill(true);
        const output = [];
        from(input)
            .pipe(ezs('URLConnect', {
                url: `${getEZSHost(1)}/transit.ini`,
                timeout: 5000,
                method: 'TOTO', // utilisera POST car non autorisé
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
    }, 30000);
    test('#1ter', (done) => {
        ezs.use(statements);
        const input = [1, 2, 3, 4, 5];
        const output = [];
        from(input)
            .pipe(ezs('URLConnect', {
                url: `${getEZSHost(1)}/transit.ini`,
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
    }, 30000);
    test('#2', (done) => {
        ezs.use(statements);
        const input = [1, 2, 3, 4, 5];
        const output = [];
        from(input)
            .pipe(ezs('debug'))
            .pipe(ezs('URLConnect', {
                url: `${getEZSHost(1)}/transit.ini`,
                json: false,
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
    }, 30000);
    test('#3', (done) => {
        ezs.use(statements);
        const input = [1, 2, 3, 4, 5];
        from(input)
            .pipe(ezs('URLConnect', {
                url: `${getEZSHost(1)}/nofound.ini`,
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
    }, 30000);
    test('#3bis', (done) => {
        ezs.use(statements);
        const input = [1, 2, 3, 4, 5];
        from(input)
            .pipe(ezs('URLConnect', {
                url: `${getEZSHost(1)}/nofound.ini`,
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
    }, 30000);
    test('#3.1', (done) => {
        ezs.use(statements);
        const input = [1, 2, 3, 4, 5];
        const output = [];
        const stream = from(input)
            .pipe(ezs('URLConnect', {
                url: `${getEZSHost(1)}/nofound.ini`,
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
                stream.destroy();
                done();
            });
    }, 30000);
    test('#3.1bis', (done) => {
        ezs.use(statements);
        const input = [1, 2, 3, 4, 5];
        const output = [];
        const stream = from(input)
            .pipe(ezs('URLConnect', {
                url: `${getEZSHost(1)}/nofound.ini`,
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
                stream.destroy();
                done();
            });
    }, 30000);
    if (semver.gte(process.version, '14.0.0')) {
        test('#4', (done) => {
            ezs.use(statements);
            const input = ['1a', '2a', '3a', '4a', '5a'];
            const stream = from(input)
                .pipe(ezs('URLConnect', {
                    url: `${getEZSHost(1)}/tocsv.ini`,
                    retries: 2,
                    json: true,
                }))
                .pipe(ezs.catch())
                .on('error', (e) => {
                    try {
                        stream.destroy();
                        expect(e.message).toEqual(expect.stringContaining('URL returned an invalid JSON response'));
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
        }, 30000);
        test('#4bis', (done) => {
            ezs.use(statements);
            const input = ['1a', '2a', '3a', '4a', '5a'];
            from(input)
                .pipe(ezs('URLConnect', {
                    url: `${getEZSHost(1)}/tocsv.ini`,
                    streaming: true,
                    json: true,
                }))
                .pipe(ezs.catch())
                .on('error', (e) => {
                    try {
                        expect(e.message).toEqual(expect.stringContaining('Invalid JSON'));
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
        }, 30000);
        test('#4ter', (done) => {
            ezs.use(statements);
            const input = ['1a', '2a', '3a', '4a', '5a'];
            from(input)
                .pipe(ezs('URLConnect', {
                    url: `${getEZSHost(1)}/empty.ini`,
                    json: true,
                    retries: 1,
                }))
                .pipe(ezs.catch())
                .on('error', (e) => {
                    try {
                        expect(e.message).toEqual(expect.stringContaining('URL returned an empty response'));
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
        }, 30000);
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
    }, 30000);
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
    }, 30000);
});


describe('URLConnect inside expand', () => {
    const input = [{id:1, value:'a'}, {id:2, value: 'b'}, {id:3, value:'c'}, {id:4, value:'c'}, {id:5, value:'e'}];
    const getScript = (noerror) => `
                [expand]
                path = value
                size = 2
                [expand/URLConnect]
                retries = 0
                timeout = 1
                noerror = ${noerror}
                url = ${getHost(1)}/timer
                header = x-timeout:slow
    `
    test('throw error', (done) => {
        ezs.use(statements);
        from(input)
            .pipe(ezs('delegate', {
                script: getScript('false'),
            }))
            .pipe(ezs.catch())
            .on('error', (e) => {
                 try {
                     expect(e.message).toEqual(expect.stringContaining('<Error: [URLConnect]'));
                     done();
                 } catch(ee) {
                     done(ee);
                 }
                done();
            })
            .on('end', () => {
                done(new Error('Error is the right behavior'));
            });
    }, 30000);
    test('inject error #1', (done) => {
        ezs.use(statements);
        const output = [];
        from(input)
            .pipe(ezs('delegate', {
                script: getScript('true'),
            }))
            .on('data', (d) => {
                output.push(d);
            })
            .on('error', (e) => {
                done(e);
            })
            .on('end', () => {
                expect(output.length).toBe(5);
                const outputSorted = output.sort((a, b) => a.id - b.id);
                expect(outputSorted[0].value.message).toEqual(expect.stringContaining('timeout'));
                expect(outputSorted[1].value.message).toEqual(expect.stringContaining('The value has not been processed'));
                expect(outputSorted[2].value.message).toEqual(expect.stringContaining('timeout'));
                expect(outputSorted[3].value.message).toEqual(expect.stringContaining('The value has not been processed'));
                expect(outputSorted[4].value.message).toEqual(expect.stringContaining('timeout'));
                done();
            });
    }, 30000);
    test('inject error #2', (done) => {
        ezs.use(statements);
        const script = `
                [expand]
                path = value
                size = 2
                [expand/URLConnect]
                retries = 0
                noerror = true
                url: http://127.0.0.1:11111/
    `;
        const output = [];
        from(input)
            .pipe(ezs('delegate', {
                script,
            }))
            .on('data', (d) => {
                output.push(d);
            })
            .on('error', (e) => {
                done(e);
            })
            .on('end', () => {
                expect(output.length).toBe(5);
                const outputSorted = output.sort((a, b) => a.id - b.id);
                expect(outputSorted[0].value.message).toEqual(expect.stringContaining('fetch failed'));
                expect(outputSorted[1].value.message).toEqual(expect.stringContaining('The value has not been processed'));
                expect(outputSorted[2].value.message).toEqual(expect.stringContaining('fetch failed'));
                expect(outputSorted[3].value.message).toEqual(expect.stringContaining('The value has not been processed'));
                expect(outputSorted[4].value.message).toEqual(expect.stringContaining('fetch failed'));
                done();
            });
    }, 30000);



});

describe('URLConnect error and retry', () => {
    describe('line', () => {
        const input = ['1a', '2a', '3a', '4a', '5a'];
        test('base line with no timeout', (done) => {
            ezs.use(statements);
            const output = [];
            from(input)
                .pipe(ezs('URLConnect', {
                    url: `${getHost(1)}/timer`,
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
        }, 30000);


        test('one retry, errors every time', (done) => {
            ezs.use(statements);
            from(input)
                .pipe(ezs('URLConnect', {
                    url: `${getHost(1)}/timer`,
                    json: true,
                    streaming: true,
                    timeout: 100,
                    header: 'x-timeout:all',
                }))
                .pipe(ezs.catch())
                .on('error', (e) => {
                    try {
                        expect(e.message).toEqual(expect.stringContaining('time'));
                        done();
                    } catch(ee) {
                        done(ee);
                    }
                })
                .on('end', () => {
                    done(new Error('Error is the right behavior'));
                });
        }, 30000);

        test('two retry, errors every time', (done) => {
            ezs.use(statements);
            from(input)
                .pipe(ezs('URLConnect', {
                    url: `${getHost(1)}/timer`,
                    json: true,
                    retries: 2,
                    timeout: 100,
                    header: 'x-timeout:all',
                }))
                .pipe(ezs.catch())
                .on('error', (e) => {
                    try {
                        expect(e.message).toEqual(expect.stringContaining('time'));
                        done();
                    } catch(ee) {
                        done(ee);
                    }
                })
                .on('end', () => {
                    done(new Error('Error is the right behavior'));
                });
        }, 30000);

        test('two retry, error once time', (done) => {
            ezs.use(statements);
            const output = [];
            from(input)
                .pipe(ezs('URLConnect', {
                    url: `${getHost(1)}/timer`,
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
        }, 30000);
    });
    describe('deep', () => {
        ezs.use(ezsAnalytics);
        const getScript = (timeout, streaming, mode, retries = 2, port = '') => `
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
url = ${getHost(1)}${port}/timer
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

        describe('regular connexion', () => {
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
            }, 30000);

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
            }, 30000);

            test('one retry, timeout errors every time', (done) => {
                ezs.use(statements);
                from(input)
                    .pipe(ezs('delegate', { script: getScript(500, true, 'all') }))
                    .pipe(ezs.catch())
                    .on('error', (e) => {
                        try {
                            expect(e.message).toEqual(expect.stringContaining('time'));
                            done();
                        } catch(ee) {
                            done(ee);
                        }
                    })
                    .on('end', () => {
                        done(new Error('Error is the right behavior'));
                    });
            }, 30000);


            test('two retry, timeout errors every time', (done) => {
                ezs.use(statements);
                from(input)
                    .pipe(ezs('delegate', { script: getScript(500, false, 'all') }))
                    .pipe(ezs.catch())
                    .on('error', (e) => {
                        try {
                            expect(e.message).toEqual(expect.stringContaining('time'));
                            done();
                        } catch(ee) {
                            done(ee);
                        }
                    })
                    .on('end', () => {
                        done(new Error('Error is the right behavior'));
                    });
            }, 30000);


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
            }, 30000);

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
            }, 30000);

            test('one retry, connect errors every time', (done) => {
                ezs.use(statements);
                from(input)
                    .pipe(ezs('delegate', { script: getScript(30000, false, 'all', 2, '9') }))
                    .pipe(ezs.catch())
                    .on('error', (e) => {
                        done();
                    })
                    .on('end', () => {
                        done(new Error('Error is the right behavior'));
                    });
            }, 60000);

            test('five retry, erratic error some time', (done) => {
                // one out of two requests is rejected
                const output = [];
                ezs.use(statements);
                from(input)
                    .pipe(ezs('delegate', { script: getScript(20000, false, 'erratic', 5) }))
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
        });

        describe('slow connexion', () => {
            describe('base line', () => {
                test('streaming', (done) => {
                    const output = [];
                    ezs.use(statements);
                    from(input)
                        .pipe(ezs('delegate', { script: getScript(30000, true, 'slow') }))
                        .pipe(ezs.catch())
                        .on('data', (chunk) => {
                            output.push(chunk);
                        })
                        .on('end', () => {
                            expect(output.length).toBe(5);
                            expect(output.sort((a, b) => (a.id > b.id ? 1 : -1))).toStrictEqual(input);
                            done();
                        });
                }, 60000);
                test('retry 5', (done) => {
                    const output = [];
                    ezs.use(statements);
                    from(input)
                        .pipe(ezs('delegate', { script: getScript(30000, true, 'slow', 5) }))
                        .pipe(ezs.catch())
                        .on('data', (chunk) => {
                            output.push(chunk);
                        })
                        .on('end', () => {
                            expect(output.length).toBe(5);
                            expect(output.sort((a, b) => (a.id > b.id ? 1 : -1))).toStrictEqual(input);
                            done();
                        });
                }, 60000);
            });
            describe('feed expire', () => {
                test('streaming', (done) => {
                    const output = [];
                    ezs.use(statements);
                    ezs.settings.feed.timeout = 10;
                    from(input)
                        .pipe(ezs('delegate', { script: getScript(30000, true, 'slow') }))
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
                }, 60000);

                test('retry 5', (done) => {
                    const output = [];
                    ezs.use(statements);
                    ezs.settings.feed.timeout = 10;
                    from(input)
                        .pipe(ezs('delegate', { script: getScript(30000, false, 'slow', 5) }))
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
                }, 60000);
            });
        });

    });
});
