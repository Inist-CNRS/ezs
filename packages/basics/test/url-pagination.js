import from from 'from';
import nock from 'nock';
import ezs from '../../core/src';
import statements from '../src';

const httpbin = nock('https://registry.npmjs.com').persist(true);
httpbin
    .get('/-/v1/search?text=ezs')
    .reply(200, {
        total: 23,
    });

httpbin
    .get('/-/v1/search?text=nested')
    .reply(200, {
        result: {
            total: 23,
        }
    });

httpbin
    .get('/-/v1/search?text=noresult')
    .reply(200, {
        total: 0,
    });

httpbin
    .get('/-/v1/search?text=empty')
    .reply(200, {
    });

httpbin
    .get('/-/v1/search?text=ten')
    .reply(200, {
        total: 10,
    });

describe('URLPagination', () => {
    test('#1', (done) => {
        ezs.use(statements);
        const input = [
            { text: 'ezs' },
        ];
        const output = [];
        const script = `
            [URLPagination]
            url = https://registry.npmjs.com/-/v1/search
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
            [URLPagination]
            url = https://registry.npmjs.com/-/v1/search
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
            [URLPagination]
            url = https://registry.npmjs.com/-/v1/search
            path = result.total
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
            [URLPagination]
            url = https://registry.npmjs.com/-/v1/search
        `;
        from(input)
            .pipe(ezs('delegate', { script }))
            .pipe(ezs.catch())
            .on('error', (e) => {
                expect(e.message).toMatch('No result.');
                done();
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
            [URLPagination]
            url = https://registry.npmjs.com/-/v1/search
        `;
        from(input)
            .pipe(ezs('delegate', { script }))
            .pipe(ezs.catch())
            .on('error', (e) => {
                expect(e.message).toMatch('Unexpected response.');
                done();
            })
            .on('end', () => {
                done(new Error('Error is the right behavior'));
            });
    });


});
