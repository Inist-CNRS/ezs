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
    .get('/status/400')
    .reply(400);

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
        from(input)
            .pipe(ezs('URLFetch', { url: 'http://unknow' }))
            .on('data', (e) => {
                expect(() => {
                    throw e.sourceError;
                }).toThrow('http://unknow/');
            })
            .on('end', () => {
                done();
            });
    }, 6000);
});
