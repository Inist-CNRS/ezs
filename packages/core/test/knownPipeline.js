import http from 'http';
import assert from 'assert';
import semver from 'semver';
import from from 'from';
import fetch from 'node-fetch';
import { PassThrough } from 'stream';
import ezs from '../src';

ezs.use(require('./locals'));

ezs.addPath(__dirname);

ezs.settings.servePath = __dirname;
ezs.settings.cacheEnable = true;
ezs.settings.tracerEnable = false;
ezs.settings.metricsEnable = false;
ezs.settings.feed.timeout = 330000;

describe(' through server(s)', () => {
    const server5 = ezs.createServer(33333, __dirname);
    const options = (path = '/transit.ini') => ({
        hostname: '0.0.0.0',
        port: 33333,
        path,
        method: 'POST',
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Accept': 'text/plain',
            'Accept-Language': 'en-US,en;q=0.8',
            'Connection': 'Close'
        }
    });

    afterAll(() => {
        server5.close();
    });

    it('POST transit.ini', (done) => {
        const stream = from([
            'hello',
            'world',
        ]);
        fetch('http://127.0.0.1:33333/transit.ini', { method: 'POST', body: stream })
            .then((res) => res.text())
            .then((text) => {
                assert.equal(text, 'helloworld');
                done();
            })
            .catch(done);
    });

    it('OPTIONS transit.ini', (done) => {
        const stream = from([
            'hello',
            'world',
        ]);
        fetch('http://127.0.0.1:33333/transit.ini', { method: 'OPTIONS', body: stream })
            .then((res) => res.text())
            .then((text) => {
                assert.equal(text, '');
                done();
            })
            .catch(done);
    });


    it('transit2.ini', (done) => {
        const stream = from([
            'hello',
            'world',
        ]);
        fetch('http://127.0.0.1:33333/transit2.ini', { method: 'POST', body: stream })
            .then((res) => {
                assert.equal(res.headers.get('content-type'), 'text/plain');
                return res.text();
            })
            .then((text) => {
                assert.equal(text, 'helloworld');
                done();
            })
            .catch(done);
    });

    if (semver.gte(process.version, '11.0.0')) {
        describe('buggy scripts' , () => {
            it('buggy1.ini', (done) => {
                const input = Array(1000000).fill('a');
                const stream = from(input);
                fetch('http://127.0.0.1:33333/buggy1.ini', { method: 'POST', body: stream })
                    .then((res) => {
                        assert(!res.ok);
                        return res.json();
                    })
                    .then((json) => {
                        assert.equal(json.scope, 'statements');
                        done();
                    })
                    .catch(done);
            });

            it('buggy2.ini', (done) => {
                const input = Array(1000000).fill('a');
                const stream = from(input);
                fetch('http://127.0.0.1:33333/buggy2.ini', { method: 'POST', body: stream })
                    .then((res) => {
                        assert(!res.ok);
                        return res.json();
                    })
                    .then((json) => {
                        assert.equal(json.scope, 'data');
                        done();
                    })
                    .catch(done);
            });

            it('buggy3.ini', (done) => {
                const input = Array(1000000).fill('a');
                const stream = from(input);
                fetch('http://127.0.0.1:33333/buggy3.ini', { method: 'POST', body: stream })
                    .then((res) => {
                        assert(!res.ok);
                        return res.json();
                    })
                    .then((json) => {
                        assert.equal(json.scope, 'statements');
                        done();
                    })
                    .catch(done);
            });
            it('buggy4.ini', (done) => {
                const output = [];
                const input = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
                const stream = from(input);
                fetch('http://127.0.0.1:33333/buggy4.ini', { method: 'POST', body: stream })
                    .then((res) => {
                        res.body.on('data', (chunk) => {
                            output.push(chunk);
                        });
                        res.body.on('error', done);
                        res.body.on('end', () => {
                            assert.equal(output.length, 0);
                            done();
                        })
                    })
                    .catch(done);
            });
            it('buggy5.ini', (done) => {
                const output = [];
                const input = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
                const stream = from(input);
                fetch('http://127.0.0.1:33333/buggy5.ini', { method: 'POST', body: stream })
                    .then((res) => {
                        res.body.on('data', (chunk) => {
                            output.push(chunk);
                        });
                        res.body.on('error', done);
                        res.body.on('end', () => {
                            assert.equal(output.length, 0);
                            done();
                        })
                    })
                    .catch(done);
            });
        });
    }

    it('transit.ini with paramaters', (done) => {
        const stream = from([
            'hello',
            'world',
        ]);
        fetch('http://127.0.0.1:33333/transit.ini?toto=titi', { method: 'POST', body: stream })
            .then((res) => res.text())
            .then((text) => {
                assert.equal(text, 'helloworld');
                done();
            })
            .catch(done);
    });

    it('replace.ini with paramaters', (done) => {
        const stream = from([
            '{"a":1}\n{"a":2}\n{"a":3}\n',
        ]);
        fetch('http://127.0.0.1:33333/replace.ini?key=a&with=titi', { method: 'POST', body: stream })
            .then((res) => res.json())
            .then((json) => {
                assert.equal(json[0].a, 'titi');
                done();
            })
            .catch(done);
    });

    it('transit.ini + replace.ini with paramaters', (done) => {
        const stream = from([
            '{"a":1}\n{"a":2}\n{"a":3}\n',
        ]);
        fetch('http://127.0.0.1:33333/transit.ini,replace.ini?key=a&with=titi', { method: 'POST', body: stream })
            .then((res) => res.json())
            .then((json) => {
                assert.equal(json[0].a, 'titi');
                done();
            })
            .catch(done);
    });


    it('text.ini #1', (done) => {
        const data = 'azertyuiopqsdfghjklmw<xcvbn,;';
        const stream = from([
            data,
        ]);
        fetch('http://127.0.0.1:33333/transit.ini,text.ini', { method: 'POST', body: stream })
            .then((res) => {
                assert.equal(res.headers.get('content-type'), 'text/plain');
                return res.text();
            })
            .then((text) => {
                assert.equal(text.slice(2, -2), data);
                done();
            })
            .catch(done);
    });

    it('text.ini #2', (done) => {
        const data = 'azertyuiopqsdfghjklmw<xcvbn,;';
        const stream = from([
            data,
        ]);
        fetch('http://127.0.0.1:33333/transit,text', { method: 'POST', body: stream })
            .then((res) => {
                assert.equal(res.headers.get('content-type'), 'text/plain');
                return res.text();
            })
            .then((text) => {
                assert.equal(text.slice(2, -2), data);
                done();
            })
            .catch(done);
    });

    it('part1-3.ini with paramaters', (done) => {
        const stream = from([
            '{"a":1}\n{"a":2}\n{"a":3}\n',
        ]);
        fetch('http://127.0.0.1:33333/part1.ini,part2.ini,assign.ini,part3.ini?key=a&with=titi', { method: 'POST', body: stream })
            .then((res) => res.json())
            .then((json) => {
                assert.equal(json[0].a, 'titi');
                assert.equal(json[1].hello, 'world');
                done();
            })
            .catch(done);
    });

    it('get no found script', (done) => {
        fetch('http://127.0.0.1:33333/script.xxx')
            .then((res) => {
                assert.equal(res.status, 404);
                done();
            })
            .catch(done);
    });

    it('get no found script #2', (done) => {
        fetch('http://127.0.0.1:33333/;;;?key=a&with=titi')
            .then((res) => {
                assert.equal(res.status, 404);
                done();
            })
            .catch(done);
    });

    it('get no found url ', (done) => {
        fetch('http://127.0.0.1:33333/script.xxx', { method: 'HEAD' })
            .then((res) => {
                assert.equal(res.status, 404);
                done();
            })
            .catch(done);
    });

    it('no found url & method', (done) => {
        fetch('http://127.0.0.1:33333/', { method: 'OPTIONS' })
            .then((res) => {
                assert.equal(res.status, 200);
                done();
            })
            .catch(done);
    });

    it('not found method', (done) => {
        fetch('http://127.0.0.1:33333/json.ini?key=a&with=titi', { method: 'GET' })
            .then((res) => {
                assert.equal(res.status, 404);
                done();
            })
            .catch(done);
    });

    describe('truncate', () => {
        const size = 10000;
        const input = Array(size).fill('a');
        it('truncate request #1', (done) => {
            let check = 0;
            const stream = from(input).pipe(ezs(
                (data, feed, ctx) => {
                    if (ctx.isLast()) return feed.close();
                    check += 1;
                    return feed.send(data);
                })
            );
            let output = 0;
            const req = http.request(options('/transit.ini'), (res) => {
                res.setEncoding('utf8');
                res.on('error', done);
                res.on('data', () => {
                    output += 1;
                });
                res.on('end', () => {
                    assert.equal(output, size);
                    assert.equal(output, check);
                    done();
                });
            });
            stream.pipe(req);
        }, 60000);
        it('truncate request #1bis', (done) => {
            let check = 0;
            const stream = from(input).pipe(ezs(
                (data, feed, ctx) => {
                    if (ctx.isLast()) {
                        feed.close();
                        return setImmediate(() => feed.write('x')); // It's bad
                    }
                    check += 1;
                    return feed.send(data);
                })
            );
            let output = 0;
            const req = http.request(options('/transit.ini'), (res) => {
                res.setEncoding('utf8');
                res.on('error', done);
                res.on('data', () => {
                    output += 1;
                });
                res.on('end', () => {
                    assert.equal(output, size);
                    assert.equal(output, check);
                    done();
                });
            });
            stream.pipe(req).on('error', (e) => {
                assert.match(e.message, /reminder/);
                done();
            });
        }, 60000);
        it('truncate request #2', (done) => {
            let check = 0;
            const stream = from(input).pipe(ezs(
                (data, feed, ctx) => {
                    if (ctx.isLast()) return feed.close();
                    check += 1;
                    return feed.send(data);
                })
            );
            const output = [];
            const req = http.request(options('/transit3.ini'), (res) => {
                res.setEncoding('utf8');
                res.on('error', done);
                res.on('data', (chunk) => {
                    output.push(chunk);
                });
                res.on('end', () => {
                    assert.equal(output.join(''), 'a');
                    assert(check < (input.length / 2));
                    done();
                });
            });
            stream.pipe(req);
        }, 60000);
        it('truncate request #3', (done) => {
            let check = 0;
            const stream = from(['a']).pipe(ezs(
                (data, feed, ctx) => {
                    if (ctx.isLast()) return feed.close();
                    check += 1;
                    return feed.send(data);
                })
            );
            const output = [];
            const req = http.request(options(`/transit4.ini?size=${size}`), (res) => {
                res.setEncoding('utf8');
                res.on('error', done);
                res.on('data', (chunk) => {
                    output.push(chunk);
                });
                res.on('end', () => {
                    assert.equal(output[0], 'a');
                    assert.equal(output.length, size);
                    done();
                });
            });
            stream.pipe(req);
        }, 60000);
    });

    describe('errors' , () => {
        it('abort request', (done) => {
            const input = Array(1000000).fill('a');
            const stream = from(input);
            fetch('http://127.0.0.1:33333/transit.ini', { method: 'POST', body: stream })
                .then(() => true)
                .catch(() => {
                    done();
                });
            setTimeout(() => stream.destroy(), 10);
        });
        it.skip('too long request', (done) => {
            const input = Array(1).fill('a');
            const stream = from(input);
            const req = http.request(options('/transit5.ini'), (res) => {
                res.setEncoding('utf8');
                res.on('error', done);
                res.on('data', (chunk) => true);
                res.on('end', () => {
                    done();
                });
            });
            stream.pipe(req);
        }, 60000);

        it('baseline', (done) => {
            const stream = from(['1', '2', '3', '4', '5', '6', '7', '8', '9']);
            const output = [];
            const req = http.request(options(), (res) => {
                res.setEncoding('utf8');
                res.on('error', done);
                res.on('data', (chunk) => {
                    output.push(chunk);
                });
                res.on('end', () => {
                    assert.equal(output.join(''), '123456789');
                    done();
                });
            });
            stream.pipe(req);
        });

        it('kill req', (done) => {
            const input = Array(1000).fill('a');
            const stream = from(input);
            const output = [];
            const req = http.request(options(), (res) => {
                res.setEncoding('utf8');
                res.on('data', (chunk) => {
                    output.push(chunk);
                    if (output.length >= 100) {
                        req.destroy();
                    }
                });
            });
            stream.pipe(req);
            req.on('close', () => {
                assert.equal(output.length, 100);
                done();
            });
        });

        it('kill req at start', (done) => {
            const input = Array(1000).fill('a');
            const stream = from(input);
            const output = [];
            const req = http.request(options(), (res) => {
                res.setEncoding('utf8');
                res.on('error', () => done());
                res.on('data', (chunk) => {
                    output.push(chunk);
                });
                res.on('end', () => done());
            });
            stream.pipe(req).on('error', () => {
                assert.equal(output.length, 0);
                done();
            });
            req.destroy(new Error('BOOM'));
        });

        it('kill req (socket)', (done) => {
            const input = Array(1000).fill('a');
            const stream = from(input);
            const output = [];
            const req = http.request(options(), (res) => {
                res.setEncoding('utf8');
                res.on('data', (chunk) => {
                    output.push(chunk);
                    if (output.length >= 100) {
                        req.socket.destroy();
                    }
                });
            });
            stream.pipe(req);
            req.on('close', () => {
                assert.equal(output.length, 100);
                done();
            });
        });

        it('kill res', (done) => {
            const input = Array(1000).fill('a');
            const stream = from(input);
            const output = [];
            const req = http.request(options(), (res) => {
                res.setEncoding('utf8');
                res.on('error', done);
                res.on('data', (chunk) => {
                    output.push(chunk);
                    if (output.length >= 100) {
                        res.destroy();
                    }
                });
                res.on('close', () => {
                    assert(output.length > 0);
                    done();
                });
            });
            stream.pipe(req);
        });

        it('kill res at start', (done) => {
            const input = Array(1000).fill('a');
            const stream = from(input);
            const output = [];
            const req = http.request(options(), (res) => {
                res.setEncoding('utf8');
                res.on('error', () => done());
                res.on('data', (chunk) => {
                    output.push(chunk);
                    res.destroy();
                    setTimeout(() => {
                        assert.equal(output.length, 1);
                        done();
                    }, 100);
                });
            });
            stream.pipe(req);
        });
    });

    describe('no content' , () => {

        it('No content #1', (done) => {
            const stream = new PassThrough();
            const req = http.request(options(), () => {
                req.abort();
                done();
            });
            stream.pipe(req);
            stream.end();
        });

        it('No content #2', (done) => {
            const stream = from([]);
            fetch('http://127.0.0.1:33333/transit.ini', { method: 'POST', body: stream })
                .then((res) => res.text())
                .then((text) => {
                    assert.equal(text, '');
                    done();
                })
                .catch(done);
        });
        it('No content #3', (done) => {
            const stream = new PassThrough();
            fetch('http://127.0.0.1:33333/transit.ini', { method: 'POST', body: stream })
                .then((res) => res.text())
                .then((text) => {
                    assert.equal(text, '');
                    done();
                })
                .catch(done);
            stream.end();
        });

        /**/
    });
});

