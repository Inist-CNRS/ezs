import from from 'from';
import ezs from '../../core/src';
import statements from '.';

ezs.use(statements);

describe('$AUTOGENERATE_URI', () => {
    test('with valid parameter', (done) => {
        const script = `
            [$AUTOGENERATE_URI]            
            field = d
            naan = 12345
            subpublisher = WXZ
            uriSize = 8

            [exchange]
            value = omit('$origin')
        `;
        const input = [
            { a: '1', b: 'un', c: true },
            { a: '2', b: 'deux', c: true },
            { a: '3', b: 'trois', c: false },
            { a: '4', b: 'quatre', c: true },
        ];
        const output = [];
        from(input)
            .pipe(ezs('delegate', { script }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                expect(chunk).toEqual(expect.any(Object));
                output.push(chunk);
            })
            .on('end', () => {
                expect(output.length).toBe(4);
                expect(output[0].d).not.toBeNull();
                expect(output[1].d).not.toEqual();
                expect(output[2].d).not.toEqual();
                expect(output[3].d).not.toEqual();
                done();
            });
    });
});
