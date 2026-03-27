import from from 'from';
import nock from 'nock';
import ezs from '../../core/src';
import statements from '../src';

import { startServer, stopServer, getHost } from './fake-server.js';


beforeAll(async () => {
    await startServer();
});

afterAll(async () => {
    await stopServer();
});

describe('URLFetch', () => {
    test('#1', (done) => {
        ezs.use(statements);
        const input = [
            { a: 'a' },
            { a: 'b' },
            { a: 'c' },
        ];
        const output = [];
        const script = `
            [URLFetch]
            url = get('a').replace(/(.*)/, '${getHost()}/get?a=$1')
            json = true
            retries = 1
            target = x

            [exchange]
            value = get('x.args')
        `;
        from(input)
            .pipe(ezs('delegate', { script }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                expect(output.length).toBe(3);
                expect(output).toStrictEqual(input);
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
        const output = [];
        const script = `
            [URLFetch]
            url = get('a').replace(/(.*)/, '${getHost()}/get?a=$1')
            json = true
            retries = 1

            [exchange]
            value = get('args')
        `;
        from(input)
            .pipe(ezs('delegate', { script }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                expect(output.length).toBe(3);
                expect(output).toStrictEqual(input);
                done();
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
        const script = `
            [URLFetch]
            url = get('a').replace(/(.*)/, '${getHost()}/get?a=$1')
            json = false
            retries = 1
            target = r
        `;
        from(input)
            .pipe(ezs('delegate', { script }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                const j = JSON.parse(chunk.r);
                output.push(j.args);
            })
            .on('end', () => {
                expect(output.length).toBe(3);
                expect(output).toStrictEqual(input);
                done();
            });
    });
    test('#2ter', (done) => {
        ezs.use(statements);
        const input = [
            'a',
        ];
        const output = [];
        const script = `
            [URLFetch]
            url = ${getHost()}/get?a=
            json = false
            retries = 1
            target = r
        `;
        from(input)
            .pipe(ezs('delegate', { script }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                const j = JSON.parse(chunk.r);
                output.push(j.args);
            })
            .on('end', () => {
                expect(output.length).toBe(1);
                expect(output[0].a).toStrictEqual('');
                done();
            });
    });
    test('get datarul', (done) => {
        ezs.use(statements);
        const input = [
            'a',
        ];
        const output = [];
        const script = `
            [URLFetch]
            url = ${getHost()}/get?a=
            dataurl = true
            retries = 1
            target = r
        `;
        from(input)
            .pipe(ezs('delegate', { script }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                expect(output.length).toBe(1);
                expect(output[0].r).toEqual('data:application/json;base64,eyJhcmdzIjp7ImEiOiIifX0=');
                done();
            });
    });
    test('get & parse dataurl', (done) => {
        ezs.use(statements);
        const input = [
            'd',
        ];
        const output = [];
        const script = `
            [URLFetch]
            url = ${getHost()}/get?a=d
            dataurl = true
            retries = 1
            target = r
            [exchange]
            value = get('r')
            [debug]
            text = avant
            [DataURLParse]
            [JSONParse]
            separator = *
            [debug]
        `;
        from(input)
            .pipe(ezs('delegate', { script }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                expect(output.length).toBe(2);
                expect(output[0].args.a).toEqual('a');
                expect(output[1].args.a).toEqual('b');
                done();
            });
    });
    test('data url error', (done) => {
        ezs.use(statements);
        const input = [
            { a: 'a' },
            { a: 'b' },
            { a: 'c' },
        ];
        const script = `
            [DataURLParse]
        `;
        from(input)
            .pipe(ezs('delegate', { script }))
            .pipe(ezs.catch())
            .on('error', (e) => {
                 try {
                    expect(e.message).toEqual(expect.stringContaining('Invalid Data URL'));
                } catch(ee) {
                    return done(ee);
                }
                done();
            })
            .on('end', () => {
                done(new Error('Error is the right behavior'));
            });
    });
    test('#3', (done) => {
        ezs.use(statements);
        const input = [
            { a: 'a' },
            { a: 'b' },
            { a: 'c' },
        ];
        const script = `
            [URLFetch]
            url = get('a').replace(/(.*)/, '${getHost()}/status/400')
            json = true
            retries = 1

            [exchange]
            value = get('args')
        `;
        from(input)
            .pipe(ezs('delegate', { script }))
            .pipe(ezs.catch())
            .on('error', (e) => {
                expect(e.message).toMatch('Bad Request');
                done();
            })
            .on('end', () => {
                done(new Error('Error is the right behavior'));
            });
    });
    test('#6', (done) => {
        ezs.use(statements);
        const input = [
            { a: 'a' },
            { a: 'b' },
            { a: 'c' },
        ];
        const script = `
            [URLFetch]
            url = get('a').replace(/(.*)/, '${getHost()}/status/503')
            json = true
            retries = 2

            [exchange]
            value = get('args')
        `;
        from(input)
            .pipe(ezs('delegate', { script }))
            .pipe(ezs.catch())
            .on('error', (e) => {
                try {
                    expect(e.message).toEqual(expect.stringContaining('Service Unavailable'));
                } catch(ee) {
                    return done(ee);
                }
                return done();
            })
            .on('end', () => {
                done(new Error('Error is the right behavior'));
            });
    }, 30000);

    test('#3bis', (done) => {
        ezs.use(statements);
        const input = [
            { a: 'a' },
            { a: 'b' },
            { a: 'c' },
        ];
        const output = [];
        const script = `
            [URLFetch]
            url = get('a').replace(/(.*)/, '${getHost()}/status/503')
            noerror = true
            timeout = 20000
            retries = 1
        `;
        from(input)
            .pipe(ezs('delegate', { script }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                expect(output.length).toBe(3);
                expect(output).toStrictEqual(input);
                done();
            });
    }, 30000);
    test('#3ter', (done) => {
        ezs.use(statements);
        const input = [
            { a: 'a' },
            { a: 'b' },
            { a: 'c' },
        ];
        const output = [];
        const script = `
            [URLFetch]
            url = get('a').replace(/(.*)/, '${getHost()}/status/404')
            json = true
            retries = 1

            [exchange]
            value = get('args')
        `;
        from(input)
            .pipe(ezs('delegate', { script }))
            .on('data', (e) => {
                output.push(e);
            })
            .on('end', () => {
                expect(output.length).toBe(3);
                expect(output[1].message).toEqual(expect.stringContaining('Not Found'));
                done();
            });
    });
    test('#3qua', (done) => {
        ezs.use(statements);
        const input = [
            { a: 'a' },
            { a: 'b' },
            { a: 'c' },
        ];
        const output = [];
        const script = `
            [URLFetch]
            url = get('a').replace(/(.*)/, '${getHost()}/status/404')
            json = true
            retries = 5

            [exchange]
            value = get('args')
        `;
        from(input)
            .pipe(ezs('delegate', { script }))
            .on('data', (e) => {
                output.push(e);
            })
            .on('end', () => {
                expect(output.length).toBe(3);
                expect(output[1].message).toEqual(expect.stringContaining('Not Found'));
                done();
            });
    });
    test('#4', (done) => {
        ezs.use(statements);
        const input = [
            { a: 'a' },
            { a: 'b' },
            { a: 'c' },
        ];
        const output = [];
        from(input)
            .pipe(ezs('URLFetch', { url: 'http://127.0.0.1:11111/', retries: 1, timeout: 10000 }))
            .on('data', (e) => {
                output.push(e);
            })
            .on('end', () => {
                expect(output.length).toBe(3);
                expect(output[0].message).toEqual(expect.stringContaining('Unable to connect'));
                done();
            });
    }, 30000);
    test('#5', (done) => {
        ezs.use(statements);
        const input = [
            { a: 'a' },
            { a: 'b' },
            { a: 'c' },
        ];
        const output = [];
        from(input)
            .pipe(ezs('URLFetch', {
                url: `${getHost()}/post/1`,
                path: 'a',
                json: true,
            }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                output.push({ a: chunk });
            })
            .on('end', () => {
                expect(output.length).toBe(3);
                expect(output).toStrictEqual(input);
                done();
            });
    }, 6000);
    test('#5bis', (done) => {
        ezs.use(statements);
        const input = [
            { a: Buffer.from('a') },
            { a: Buffer.from('b') },
            { a: Buffer.from('c') },
        ];
        const output = [];
        from(input)
            .pipe(ezs('URLFetch', {
                url: `${getHost()}/post/2`,
                path: ['a', 'b'],
                mimetype: 'text/plain',
            }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                output.push({ a: chunk });
            })
            .on('end', () => {
                expect(output.length).toBe(3);
                expect(output).toStrictEqual(input.map(x => ({ a: x.a.toString()})));
                done();
            });
    }, 6000);
});
