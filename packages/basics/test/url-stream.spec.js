import from from 'from';
import nock from 'nock';
import http from 'http';
import ezs from '../../core/src';
import statements from '../src';
import { startServer, stopServer, getHost } from './fake-server.js';


beforeAll(async () => {
    await startServer(4);
});

afterAll(async () => {
    await stopServer(4);
});


describe('URLStream', () => {
    let server;
    beforeAll((ready) => {
        let count = 0;
        server = http.createServer((req, res) => {
            count += 1;
            res.writeHead(200);
            res.end(`${count}...\n`);
        });
        server.listen(55544, ready);
    });

    afterAll(() => {
        nock.cleanAll();
        server.close();
    });

    test('#0', (done) => {
        ezs.use(statements);
        const input = [
            `${getHost(4)}/get?a=a`,
            `${getHost(4)}/get?a=b`,
            `${getHost(4)}/get?a=c`,
        ];
        const output = [];
        from(input)
            .pipe(ezs('URLStream', {
                path: '.args',
            }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                output.push(`${getHost(4)}/get?a=${chunk.a}`);
            })
            .on('end', () => {
                expect(output).toStrictEqual(input);
                expect(output.length).toBe(3);
                done();
            });
    });
    test('#1', (done) => {
        ezs.use(statements);
        const input = [
            { a: 'a' },
            { a: 'b' },
            { a: 'c' },
        ];
        const output = [];
        from(input)
            .pipe(ezs('URLStream', {
                url: `${getHost(4)}/get`,
                path: '.args',
            }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                expect(output).toStrictEqual(input);
                expect(output.length).toBe(3);
                done();
            });
    });
    test('#1bis', (done) => {
        ezs.use(statements);
        const input = [
            { a: 'a' },
            { a: 'b' },
            { a: 'c' },
        ];
        const output = [];
        from(input)
            .pipe(ezs('URLStream', {
                url: 'http://127.0.0.1:55544',
                path: null,
            }))
            .pipe(ezs('TXTParse'))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                output.push(parseInt(chunk, 10));
            })
            .on('end', () => {
                expect(output).toStrictEqual([1, 2, 3]);
                expect(output.length).toBe(3);
                done();
            });
    });
    test('#2', (done) => {
        ezs.use(statements);
        const input = [
            { a: 'a' },
            { a: 'b' },
            { a: 'c' },
        ];
        from(input)
            .pipe(ezs('URLStream', {
                url: `${getHost(4)}/status/400`,
                retries: 1
            }))
            .pipe(ezs.catch())
            .on('error', (e) => {
                expect(() => {
                    throw e.sourceError;
                }).toThrow('Received status code 400 (BAD REQUEST)');
                done();
            })
            .on('data', () => {
                done(new Error('Error is the right behavior'));
            })
            .on('end', () => {
                done(new Error('Error is the right behavior'));
            });
    });
    test('#2bis', (done) => {
        ezs.use(statements);
        const input = [
            { a: 'a' },
            { a: 'b' },
            { a: 'c' },
        ];
        const output = [];
        from(input)
            .pipe(ezs('URLStream', {
                url: `${getHost(4)}/status/400`,
                noerror: true,
                retries: 1
            }))
            .pipe(ezs.catch())
            .on('error', () => {
                done(new Error('Error should be ignored'));
            })
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                expect(output).toStrictEqual(input);
                expect(output.length).toBe(3);
                done();
            });
    });
    test('#3', (done) => {
        ezs.use(statements);
        const input = [
            { a: 'a' },
            { a: 'b' },
            { a: 'c' },
        ];
        from(input)
            .pipe(ezs('URLStream', {
                url: 'http://unknow',
                retries: 1,
            }))
            .pipe(ezs.catch())
            .on('error', (e) => {
                expect(() => {
                    throw e.sourceError;
                }).toThrow('request to http://unknow/?a=a failed, reason: getaddrinfo EAI_AGAIN unknow');
                done();
            })
            .on('end', () => {
                done(new Error('Error is the right behavior'));
            });
    }, 10000);
    test('#4', (done) => {
        ezs.use(statements);
        const input = [
            { a: 'a' },
            { a: 'b' },
            { a: 'c' },
        ];
        from(input)
            .pipe(ezs('URLStream', {
                url: 'http://127.0.0.1:55544',
            }))
            .pipe(ezs.catch())
            .on('error', (e) => {
                expect(e.sourceError.message).toEqual(expect.stringContaining('Invalid JSON'));
                done();
            })
            .on('end', () => {
                done(new Error('Error is the right behavior'));
            });
    });
    test('#5', (done) => {
        ezs.use(statements);
        const input = [
            { a: 'a' },
            { a: 'b' },
            { a: 'c' },
        ];
        from(input)
            .pipe(ezs('URLStream'))
            .pipe(ezs.catch())
            .on('error', (e) => {
                expect(e.message).toEqual(expect.stringContaining('URL'));
                done();
            })
            .on('end', () => {
                done(new Error('Error is the right behavior'));
            });
    });
});
