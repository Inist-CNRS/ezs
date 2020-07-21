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
    test('#2', (done) => {
        const input = [1, 2, 3, 4, 5];
        from(input)
            .pipe(ezs('URLStream', {
                url: 'https://httpbin.org/status/400',
            }))
            .pipe(ezs.catch())
            .on('error', (e) => {
                expect(e.message).toEqual(expect.stringContaining('400'));
                done();
            })
            .on('end', () => {
                done(new Error('Error is the right behavior'));
            });
    });

});
