import from from 'from';
import nock from 'nock';
import ezs from '../../core/src';
import statements from '../src';

const registry_npmjs_com = nock('https://registry.npmjs.com').persist(true);
registry_npmjs_com
    .get('/-/v1/search?text=ezs')
    .reply(200, {
        total: 23,
    });

registry_npmjs_com
    .get('/-/v1/search?text=nested')
    .reply(200, {
        result: {
            total: 23,
        }
    });

registry_npmjs_com
    .get('/-/v1/search?text=noresult')
    .reply(200, {
        total: 0,
    });

registry_npmjs_com
    .get('/-/v1/search?text=empty')
    .reply(200, {
    });

registry_npmjs_com
    .get('/-/v1/search?text=ten')
    .reply(200, {
        total: 10,
    });

registry_npmjs_com
    .get('/-/v1/search?text=timeout')
    .delayConnection(0)
    .delayBody(1000)
    .reply(200, {
        total: 10,
    });

const httpbin = nock('https://httpbin.org').persist(true);
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




describe('URLPagination', () => {
    test('#1', (done) => {
        ezs.use(statements);
        const input = [
            { text: 'ezs' },
        ];
        const output = [];
        const script = `
            [URLRequest]
            url = https://registry.npmjs.com/-/v1/search
            [URLPagination]
            total = get('total')
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
                expect(output[0].pageNumber).toStrictEqual(1);
                done();
            });
    });

    test('#1bis', (done) => {
        ezs.use(statements);
        const input = [
            { text: 'ezs' },
        ];
        const output = [];
        const script = `
            [URLRequest]
            url = https://registry.npmjs.com/-/v1/search

            [URLPagination]
            total = get('total')
            maxPages = 2
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
                expect(output[0].pageNumber).toStrictEqual(1);
                done();
            });
    });

    test('#2', (done) => {
        ezs.use(statements);
        const input = [
            { text: 'nested' },
        ];
        const output = [];
        const script = `
            [URLRequest]
            url = https://registry.npmjs.com/-/v1/search

            [URLPagination]
            total = get('result.total')
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
                expect(output[0].pageNumber).toStrictEqual(1);
                done();
            });
    });

    test('#2bis', (done) => {
        ezs.use(statements);
        const input = [
            { text: 'nested' },
        ];
        const output = [];
        const script = `
            [exchange]
            value = fix('https://registry.npmjs.com/-/v1/search?text=nested')

            [URLRequest]

            [URLPagination]
            total = get('result.total')
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
                expect(output[0].pageNumber).toStrictEqual(1);
                done();
            });
    });

    test('#2ter', (done) => {
        ezs.use(statements);
        const input = [
            { text: 'nested' },
        ];
        const output = [];
        const script = `
            [exchange]
            value = fix('https://registry.npmjs.com/-/v1/search?text=nested')

            [URLRequest]
            target = toto

            [URLPagination]
            total = get('toto.result.total')
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
                expect(output[0].pageNumber).toStrictEqual(1);
                done();
            });
    });

    test('#3', (done) => {
        ezs.use(statements);
        const input = [
            { text: 'noresult' },
        ];
        const script = `
            [URLRequest]
            url = https://registry.npmjs.com/-/v1/search

            [URLPagination]
            total = get('total')
        `;
        from(input)
            .pipe(ezs('delegate', { script }))
            .pipe(ezs.catch())
            .on('error', (e) => {
                try {
                    expect(e.message).toEqual(expect.stringContaining('No result.'));
                    done();
                } catch (err) {
                    done(err);
                }
            })
            .on('end', () => {
                done(new Error('Error is the right behavior'));
            });
    });

    test('#4', (done) => {
        ezs.use(statements);
        const input = [
            { text: 'empty' },
        ];
        const script = `
            [URLRequest]
            url = https://registry.npmjs.com/-/v1/search
            [URLPagination]
            total = get('total')
        `;
        from(input)
            .pipe(ezs('delegate', { script }))
            .pipe(ezs.catch())
            .on('error', (e) => {
                try {
                    expect(e.message).toEqual(expect.stringContaining('Unexpected response.'));
                    done();
                } catch (err) {
                    done(err);
                }
            })
            .on('end', () => {
                done(new Error('Error is the right behavior'));
            });
    });


    test('#5', (done) => {
        ezs.use(statements);
        const input = [
            {  },
        ];
        const script = `
            [URLRequest]
            url = https://httpbin.org/status/404
            retries = 1

            [URLPagination]
            total = get('total')
        `;
        from(input)
            .pipe(ezs('delegate', { script }))
            .pipe(ezs.catch())
            .on('error', (e) => {
                try {
                    expect(e.message).toEqual(expect.stringContaining('Not Found'));
                    done();
                } catch (err) {
                    done(err);
                }
            })
            .on('end', () => {
                done(new Error('Error is the right behavior'));
            });
    });

    test('#6', (done) => {
        ezs.use(statements);
        const input = [
            { text: 'timeout' },
        ];
        const script = `
            [URLRequest]
            url = https://registry.npmjs.com/-/v1/search
            timeout = 100

            [URLPagination]
            total = get('total')
        `;
        from(input)
            .pipe(ezs('delegate', { script }))
            .pipe(ezs.catch())
            .on('error', (e) => {
                try {
                    expect(e.message).toEqual(expect.stringContaining('Response timeout'));
                    expect(e.message).toEqual(expect.stringContaining('over 100ms'));
                    done();
                } catch (err) {
                    done(err);
                }
            })
            .on('end', () => {
                done(new Error('Error is the right behavior'));
            });
    });
});
