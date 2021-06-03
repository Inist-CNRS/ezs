import from from 'from';
import ezs from '../../core/src';
import ezsBasics from '../src';

ezs.use(ezsBasics);

describe('XMLConvert', () => {
    test('XML to JSON', (done) => {
        const output = [];
        from([
            '<xml>A</xml>',
            '<xml>B</xml>',
        ])
            .pipe(ezs('XMLConvert'))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => output.push(chunk))
            .on('end', () => {
                expect(output.length).toStrictEqual(2);
                expect(output[0]).toEqual({ xml: { $t: 'A' } });
                expect(output[1]).toEqual({ xml: { $t: 'B' } });
                done();
            });
    });
    test('JSON to XML', (done) => {
        const output = [];
        from([
            { x: { a: 1 } },
            { x: { a: 2 } },
        ])
            .pipe(ezs('XMLConvert', { invert: true }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => output.push(chunk))
            .on('end', () => {
                expect(output.length).toStrictEqual(2);
                expect(output[0]).toEqual('<x a="1"/>');
                expect(output[1]).toEqual('<x a="2"/>');
                done();
            });
    });
});
