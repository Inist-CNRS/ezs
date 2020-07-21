import from from 'from';
import ezs from '../../core/src';
import ezsBasics from '../src';

ezs.use(ezsBasics);

describe('URLFetch', () => {
    test('#1', (done) => {
        const input = [
            { a: 'a' },
            { a: 'b' },
            { a: 'c' },
        ];
        const output = [];
        const script = `
            [use]
            plugin = basics

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
        const input = [
            { a: 'a' },
            { a: 'b' },
            { a: 'c' },
        ];
        const output = [];
        const script = `
            [use]
            plugin = basics

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
});
