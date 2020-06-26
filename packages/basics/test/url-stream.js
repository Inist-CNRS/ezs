import from from 'from';
import ezs from '../../core/src';
import ezsBasics from '../src';

ezs.use(ezsBasics);

describe('URLStream', () => {
    test('#1', (done) => {
        const input = [
            { a: 'a' },
            { a: 'b' },
            { a: 'c' },
        ];
        const output = [];
        from(input)
            .pipe(ezs('URLStream', {
                url: 'https://httpbin.org/get',
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
});
