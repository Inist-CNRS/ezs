import from from 'from';
import ezs from '../../core/src';
import statements from '../src';
import { startServer, stopServer, getHost } from './fake-server.js';


beforeAll(async () => {
    await startServer();
});

afterAll(async () => {
    await stopServer();
});

describe('URLPagination', () => {
    test('#1', (done) => {
        ezs.use(statements);
        const input = [
            { text: 'ezs' },
        ];
        const output = [];
        const script = `
            [URLRequest]
            url = ${getHost()}/-/v1/search
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
            url = ${getHost()}/-/v1/search

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
            url = ${getHost()}/-/v1/search

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
            value = fix('${getHost()}/-/v1/search?text=nested')

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
            value = fix('${getHost()}/-/v1/search?text=nested')

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
            url = ${getHost()}/-/v1/search

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
            url = ${getHost()}/-/v1/search
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
            url = ${getHost()}/status/404
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
            url = ${getHost()}/-/v1/search
            timeout = 100
            retries = 1

            [URLPagination]
            total = get('total')
        `;
        from(input)
            .pipe(ezs('delegate', { script }))
            .pipe(ezs.catch())
            .on('error', (e) => {
                try {
                    expect(e.message).toEqual(expect.stringContaining('The operation timed out.'));
                    done();
                } catch (err) {
                    done(err);
                }
            })
            .on('data', (a) => {
                done(new Error('Error is the right behavior 1'));
            })
            .on('end', () => {
                done(new Error('Error is the right behavior 2'));
            });
    }, 30000);
});
