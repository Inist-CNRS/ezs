import from from 'from';
import nock from 'nock';
import ezs from '../../core/src';
import statements from '../src';

const httpbin = nock('https://httpbin.org').persist(true);
httpbin
    .get('/get?a=a')
    .reply(200, {
        args: {
            a: 'a',
        },
    });
httpbin
    .get('/get?a=b')
    .reply(200, {
        args: {
            a: 'b',
        },
    });
httpbin
    .get('/get?a=c')
    .reply(200, {
        args: {
            a: 'c',
        },
    });
httpbin
    .post('/post/1')
    .reply(200, (uri, requestBody) => requestBody);
httpbin
    .post('/post/2')
    .reply(200, (uri, requestBody) => requestBody);

httpbin
    .post('/status/400')
    .reply(400);

httpbin
    .post('/status/503')
    .reply(503);

httpbin
    .post('/status/404')
    .reply(404);

httpbin
    .get('/status/404')
    .reply(404);


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
            url = get('a').replace(/(.*)/, 'https://httpbin.org/get?a=$1')
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
            url = get('a').replace(/(.*)/, 'https://httpbin.org/get?a=$1')
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
            url = get('a').replace(/(.*)/, 'https://httpbin.org/get?a=$1')
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
    test('#3', (done) => {
        ezs.use(statements);
        const input = [
            { a: 'a' },
            { a: 'b' },
            { a: 'c' },
        ];
        const script = `
            [URLFetch]
            url = get('a').replace(/(.*)/, 'https://httpbin.org/status/400')
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
            url = get('a').replace(/(.*)/, 'https://httpbin.org/status/503')
            noerror = true
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
    });
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
            url = get('a').replace(/(.*)/, 'https://httpbin.org/status/404')
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
    test('#4', (done) => {
        ezs.use(statements);
        const input = [
            { a: 'a' },
            { a: 'b' },
            { a: 'c' },
        ];
        const output = [];
        from(input)
            .pipe(ezs('URLFetch', { url: 'http://127.0.0.1:11111/', retries: 1, timeout: 2000 }))
            .on('data', (e) => {
                output.push(e);
            })
            .on('end', () => {
                expect(output.length).toBe(3);
                expect(output[0].message).toEqual(expect.stringContaining('ECONNREFUSED'));
                done();
            });
    }, 6000);
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
                url: 'https://httpbin.org/post/1',
                path: 'a',
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
                url: 'https://httpbin.org/post/2',
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
