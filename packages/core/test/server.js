import assert from 'assert';
import os from 'os';
import from from 'from';
import fetch from 'node-fetch';
import { Readable } from 'stream';
import ezs from '../src';
import JSONezs from '../src/json';

ezs.use(require('./locals'));

ezs.addPath(__dirname);

ezs.settings.servePath = __dirname;

class Upto extends Readable {
    constructor(m) {
        super({ objectMode: true });
        this.i = 0;
        this.m = m;
    }

    _read() {
        this.i += 1;
        if (this.i >= this.m) {
            this.push(null);
        } else {
            this.push(this.i);
        }
    }
}
describe('dispatch through server(s)', () => {
    const server1 = ezs.createServer();
    const server2 = ezs.createServer(30001);
    const server3 = ezs.createServer(30002);
    const server4 = ezs.createServer(30003);

    after(() => {
        server1.close();
        server2.close();
        server3.close();
        server4.close();
    });

    it('get information', (done) => {
        fetch('http://127.0.0.1:31976/')
            .then(res => res.json())
            .then((json) => {
                assert(json.uptime);
                assert.equal(os.cpus().length, json.concurrency);
                done();
            });
    });

    describe('simple known statements', () => {
        it('transit.ini', (done) => {
            const stream = from([
                'hello',
                'world',
            ]);
            fetch('http://127.0.0.1:31976/transit.ini', { method: 'POST', body: stream })
                .then(res => res.text())
                .then((text) => {
                    assert.equal(text, 'helloworld');
                    done();
                })
                .catch(done);
        });
        it('transit.ini with paramaters', (done) => {
            const stream = from([
                'hello',
                'world',
            ]);
            fetch('http://127.0.0.1:31976/transit.ini?toto=titi', { method: 'POST', body: stream })
                .then(res => res.text())
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
            fetch('http://127.0.0.1:31976/replace.ini?key=a&with=titi', { method: 'POST', body: stream })
                .then(res => res.json())
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
            fetch('http://127.0.0.1:31976/transit.ini;replace.ini?key=a&with=titi', { method: 'POST', body: stream })
                .then(res => res.json())
                .then((json) => {
                    assert.equal(json[0].a, 'titi');
                    done();
                })
                .catch(done);
        });
        it('json.ini with paramaters GET', (done) => {
            fetch('http://127.0.0.1:31976/json.ini?key=a&with=titi', { method: 'GET' })
                .then(res => res.json())
                .then((json) => {
                    assert.equal(json[0].a, 'titi');
                    done();
                })
                .catch(done);
        });
        it('text.ini', (done) => {
            const data = 'azertyuiopqsdfghjklmw<xcvbn,;';
            const stream = from([
                data,
            ]);
            fetch('http://127.0.0.1:31976/transit.ini;text.ini', { method: 'POST', body: stream })
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
            fetch('http://127.0.0.1:31976/part1.ini;part2.ini;assign.ini;part3.ini?key=a&with=titi', { method: 'POST', body: stream })
                .then(res => res.json())
                .then((json) => {
                    assert.equal(json[0].a, 'titi');
                    assert.equal(json[1].hello, 'world');
                    done();
                })
                .catch(done);
        });


    });

    it('get no found script', (done) => {
        fetch('http://127.0.0.1:31976/script.xxx')
            .then((res) => {
                assert.equal(res.status, 404);
                done();
            })
            .catch(done);
    });

    it('get no found script #2', (done) => {
        fetch('http://127.0.0.1:31976/;;;?key=a&with=titi')
            .then((res) => {
                assert.equal(res.status, 404);
                done();
            })
            .catch(done);
    });


    it('get no found url ', (done) => {
        fetch('http://127.0.0.1:31976/script.xxx', { method: 'HEAD' })
            .then((res) => {
                assert.equal(res.status, 404);
                done();
            })
            .catch(done);
    });

    it('no found url & method', (done) => {
        fetch('http://127.0.0.1:31976/', { method: 'OPTIONS' })
            .then((res) => {
                assert.equal(res.status, 404);
                done();
            })
            .catch(done);
    });


    describe('simple statements, one server', () => {
        const script = `
            [use]
            plugin = test/locals

            [increment]
            step = 3

            [decrement]
            step = 2
        `;
        const commands = [
            {
                name: 'increment',
                args: {
                    step: 3,
                },
            },
            {
                name: 'decrement',
                args: {
                    step: 2,
                },
            },
        ];
        const server = '127.0.0.1';

        it('with object', (done) => {
            let res = 0;
            const ten = new Upto(10);
            ten
                .pipe(ezs('dispatch', { commands, server }))
                .pipe(ezs('debug'))
                .on('data', (chunk) => {
                    res += chunk;
                })
                .on('end', () => {
                    assert.strictEqual(res, 54);
                    done();
                });
        });

        it('with script', (done) => {
            let res = 0;
            const ten = new Upto(10);
            ten
                .pipe(ezs('dispatch', {
                    server,
                    script,
                }, { toto: 1, titi: 'truc' }))
                .on('data', (chunk) => {
                    res += chunk;
                })
                .on('end', () => {
                    assert.strictEqual(res, 54);
                    done();
                });
        });

        it('with file', (done) => {
            let res = 0;
            const ten = new Upto(10);
            ten
                .pipe(ezs('dispatch', {
                    server,
                    file: './script.ini',
                }))
                .on('data', (chunk) => {
                    res += chunk;
                })
                .on('end', () => {
                    assert.strictEqual(res, 54);
                    done();
                });
        });


        it('with script', (done) => {
            let res = 0;
            const ten = new Upto(10);
            ten
                .pipe(ezs('dispatch', {
                    server,
                    script,
                }))
                .on('data', (chunk) => {
                    res += chunk;
                })
                .on('end', () => {
                    assert.strictEqual(res, 54);
                    done();
                });
        });

        it('with commands', (done) => {
            let res = 0;
            const ten = new Upto(10);
            ten
                .pipe(ezs('dispatch', {
                    server,
                    commands,
                }))
                .on('data', (chunk) => {
                    res += chunk;
                })
                .on('end', () => {
                    assert.strictEqual(res, 54);
                    done();
                });
        });
    });

    it('simple statements, N servers', (done) => {
        let res = 0;
        const commands = [
            {
                name: 'increment',
                args: {
                    step: 3,
                },
            },
            {
                name: 'decrement',
                args: {
                    step: 2,
                },
            },
        ];
        const server = [
            '127.0.0.1',
            '127.0.0.1',
            '127.0.0.1',
            '127.0.0.1',
            '127.0.0.1',
            '127.0.0.1',
            '127.0.0.1',
            '127.0.0.1',
            '127.0.0.1',
            '127.0.0.1',
        ];
        const ten = new Upto(10);
        ten
            .pipe(ezs('dispatch', { commands, server }))
            .pipe(ezs.catch())
            .on('data', (chunk) => {
                res += chunk;
            })
            .on('end', () => {
                assert.strictEqual(res, 54);
                done();
            });
    });


    it('simple statements, one server but with different parameter', (done) => {
        let res = 0;
        const commands = [
            {
                name: 'increment',
                args: {
                    step: 3,
                },
            },
            {
                name: 'decrement',
                args: {
                    step: 2,
                },
            },
        ];
        const server = [
            '127.0.0.1',
        ];
        const ten = new Upto(10);
        ten
            .pipe(ezs('dispatch', { commands, server }))
            .on('data', (chunk) => {
                res += chunk;
            })
            .on('end', () => {
                assert.strictEqual(res, 54);
                done();
            });
    });

    it('with commands using args contains UTF8 parameter', (done) => {
        const res = [];
        const commands = [
            {
                name: 'replace',
                args: {
                    path: 'id',
                    value: 'Les Châtiments',
                },
            },
        ];
        const server = [
            '127.0.0.1',
        ];
        const ten = new Upto(10);
        ten
            .pipe(ezs('dispatch', { commands, server }))
            .on('data', (chunk) => {
                res.push(chunk);
            })
            .on('end', () => {
                assert.strictEqual(res[0].id, 'Les Châtiments');
                assert.strictEqual(res[1].id, 'Les Châtiments');
                assert.strictEqual(res[2].id, 'Les Châtiments');
                done();
            });
    });


    it('with commands using global parameter', (done) => {
        let res = 0;
        const commands = [
            {
                name: 'stepper',
                args: {
                    step: 4,
                },
            },
        ];
        const server = [
            '127.0.0.1',
        ];
        const ten = new Upto(10);
        ten
            .pipe(ezs('dispatch', { commands, server }))
            .on('data', (chunk) => {
                res += chunk;
            })
            .on('end', () => {
                assert.strictEqual(res, 81);
                done();
            });
    });


    it('with buggy statements', (done) => {
        const commands = [
            {
                name: 'increment',
                args: {
                    step: 2,
                },
            },
            {
                name: 'boum',
                args: {
                    step: 2,
                },
            },
        ];
        const server = [
            '127.0.0.1',
        ];
        const ten = new Upto(10);
        ten
            .pipe(ezs('dispatch', { commands, server }))
            .pipe(ezs.catch())
            .on('error', (error) => {
                assert.ok(error instanceof Error);
                done();
            });
    });
    it('with unknowed server', (done) => {
        const commands = [
            {
                name: 'increment',
                args: {
                    step: 2,
                },
            },
        ];
        const server = [
            '127.0.0.0',
        ];
        const ten = new Upto(10);
        let semaphore = true;
        ten
            .pipe(ezs('dispatch', { commands, server }))
            .pipe(ezs.catch())
            .on('error', (error) => {
                assert(error instanceof Error);
                if (semaphore) {
                    semaphore = false;
                    done();
                }
            });
    });

    it('with an unknowed statement', (done) => {
        const commands = [
            {
                name: 'increment',
                args: {
                    step: 2,
                },
            },
            {
                name: 'turlututu',
                args: {
                    step: 2,
                },
            },
        ];
        const server = [
            '127.0.0.1',
        ];
        const ten = new Upto(10);
        let semaphore = true;
        ten
            .pipe(ezs('dispatch', { commands, server }))
            .pipe(ezs.catch())
            .on('error', (error) => {
                assert(error instanceof Error);
                if (semaphore) {
                    semaphore = false;
                    ten.destroy();
                    done();
                }
            });
    });
    it('with commands in distributed pipeline', (done) => {
        const commands = [
            {
                name: 'increment',
                mode: 'detachable',
                args: {
                    step: 3,
                },
            },
            {
                name: 'decrement',
                mode: 'detachable',
                args: {
                    step: 2,
                },
            },
        ];
        const server = [
            '127.0.0.1:30001',
            '127.0.0.1:30002',
            '127.0.0.1:30003',
        ];
        let res = 0;
        const ten = new Upto(10);
        ten
            .pipe(ezs('dispatch', { server, commands }))
            .on('data', (chunk) => {
                res += chunk;
            })
            .on('end', () => {
                assert.strictEqual(res, 54);
                done();
            });
    });
    it('with commands in distributed pipeline #Bis', (done) => {
        const commands = [
            {
                name: 'increment',
                mode: 'detachable',
                args: {
                    step: 3,
                },
            },
            {
                name: 'decrement',
                mode: 'detachable',
                args: {
                    step: 2,
                },
            },
        ];
        const server = [
            '127.0.0.1:30001',
            '127.0.0.1:30002',
            '127.0.0.1:30003',
        ];
        let res = 0;
        const ten = new Upto(10);
        ten
            .pipe(ezs('shift'))
            .pipe(ezs('dispatch', { server, commands }))
            .on('data', (chunk) => {
                res += chunk;
            })
            .on('end', () => {
                assert.strictEqual(res, 2);
                done();
            });
    });


    it('with a lot of commands in distributed pipeline', (done) => {
        const commands = [
            {
                name: 'replace',
                mode: 'detachable',
                args: {
                    path: 'a',
                    value: 1,
                },
            },
        ];
        const server = [
            '127.0.0.1:30001',
            '127.0.0.1:30002',
            '127.0.0.1:30003',
        ];
        let res = 0;
        const ten = new Upto(500001);
        ten
            .pipe(ezs('replace', { path: 'a', value: '2' }))
            .pipe(ezs('dispatch', { server, commands })) // ~ 9 seconds
            .on('data', (chunk) => {
                res += chunk.a;
            })
            .on('end', () => {
                assert.strictEqual(res, 500000);
                done();
            });
    }).timeout(100000);

    it('with a lot of delayed commands in distributed pipeline', (done) => {
        const script = `
            [use]
            plugin = test/locals

            [beat?detachable]

        `;
        const server = [
            '127.0.0.1:30001',
            '127.0.0.1:30002',
            '127.0.0.1:30003',
        ];
        let res = 0;
        const ten = new Upto(10001);
        ten
            .pipe(ezs('dispatch', { script, server }))
            .on('data', (chunk) => {
                res += chunk.beat;
            })
            .on('end', () => {
                assert.strictEqual(res, 10000);
                done();
            });
    }).timeout(50000);


    it('with a same commands', (done) => {
        const script = `
            [use]
            plugin = test/locals

            [increment]
            step = 1

        `;
        const commandsOBJ1 = ezs.parseString(script);
        const commandsSTR1 = JSONezs.stringify(commandsOBJ1);
        const commandsOBJ2 = JSONezs.parse(commandsSTR1);
        const commandsSTR2 = JSONezs.stringify(commandsOBJ2);
        //        assert.strictEqual(commandsOBJ1[0].args, commandsOBJ2[0].args);
        assert.strictEqual(commandsSTR1, commandsSTR2);
        done();
    });


    it('with stuck/unstuck simple pipeline', (done) => {
        const script = `

            [replace]
            path = a
            value = 7

            [assign]
            path = b
            value = 6

            [assign]
            path = c
            value = env('k')

            [env]
            path = l
            value = get('b')

            [assign]
            path = d
            value = env('l')


            [transit]
        `;
        const server = [
            '127.0.0.1',
        ];
        const env = {
            k: 5,
        };
        const res = [];
        from([
            { a: 1, b: 9 },
            { a: 2, b: 9 },
            { a: 3, b: 9 },
            { a: 4, b: 9 },
            { a: 5, b: 9 },
        ])
            .pipe(ezs('dispatch', { script, server }, env))
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(5, res.length);
                assert.equal(7, res[0].a);
                assert.equal(6, res[0].b);
                assert.equal(5, res[0].c);
                assert.equal(7, res[1].a);
                assert.equal(6, res[1].b);
                assert.equal(5, res[1].c);
                assert.equal(7, res[2].a);
                assert.equal(6, res[2].b);
                assert.equal(5, res[2].c);
                done();
            });
    });

    it('an array of array in a pipeline', (done) => {
        const script = `
            [transit]
        `;
        const server = [
            '127.0.0.1',
        ];
        const res = [];
        from([
            [1, 1, 1, 1],
            [2, 2, 2, 2],
            [3, 3, 3, 3],
            [4, 4, 4, 4],
            [5, 5, 5, 5],
        ])
            .pipe(ezs('dispatch', { script, server }))
            .on('data', (chunk) => {
                assert(Array.isArray(chunk));
                res.push(chunk);
            })
            .on('end', () => {
                const resSorted = res.sort((a, b) => a[0] - b[0]);
                assert.equal(5, resSorted.length);
                assert.equal(4, resSorted[0].length);
                assert.equal(4, resSorted[1].length);
                assert.equal(4, resSorted[2].length);
                assert.equal(4, resSorted[3].length);
                assert.equal(4, resSorted[4].length);
                assert.equal(1, resSorted[0][0]);
                assert.equal(1, resSorted[0][1]);
                assert.equal(1, resSorted[0][2]);
                assert.equal(1, resSorted[0][3]);
                assert.equal(2, resSorted[1][0]);
                assert.equal(2, resSorted[1][1]);
                assert.equal(2, resSorted[1][2]);
                assert.equal(2, resSorted[1][3]);
                assert.equal(5, resSorted[4][0]);
                assert.equal(5, resSorted[4][1]);
                assert.equal(5, resSorted[4][2]);
                assert.equal(5, resSorted[4][3]);
                done();
            });
    });


    /**/
});
