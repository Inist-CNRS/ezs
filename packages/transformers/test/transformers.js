import from from 'from';
import ezs from '../../core/src';
import statements from '../src';

ezs.use(statements);

describe('$VALUE', () => {
    test('with valid parameter', (done) => {
        const script = `
            [$VALUE]
            path = aaa
            value = toto

            [exchange]
            value = omit('$origin')
        `;
        const res = [];
        from([
            { a: 1, b: 'deux', c: true },
            { a: 2, b: 'trois', c: true },
            { a: 3, b: 'quatre', c: false },
            { a: 4, b: 'cinq', c: true },
        ])
            .pipe(ezs('delegate', { script }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                expect(chunk).toEqual(expect.any(Object));
                res.push(chunk);
            })
            .on('end', () => {
                expect(res.length).toBe(4);
                expect(res[0].aaa).toEqual('toto');
                expect(res[1].aaa).toEqual('toto');
                expect(res[2].aaa).toEqual('toto');
                expect(res[3].aaa).toEqual('toto');
                done();
            });
    });
});
describe('$URLENCODE', () => {
    test('with valid parameter', (done) => {
        const script = `
            [$URLENCODE]
            path = b

            [exchange]
            value = omit('$origin')
        `;
        const res = [];
        from([
            { a: 1, b: 'é deux', c: true },
            { a: 2, b: 'é trois', c: true },
            { a: 3, b: 'é quatre', c: false },
            { a: 4, b: 'é cinq', c: true },
        ])
            .pipe(ezs('delegate', { script }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                expect(chunk).toEqual(expect.any(Object));
                res.push(chunk);
            })
            .on('end', () => {
                expect(res.length).toBe(4);
                expect(res[0].b).toEqual('%C3%A9%20deux');
                expect(res[1].b).toEqual('%C3%A9%20trois');
                expect(res[2].b).toEqual('%C3%A9%20quatre');
                expect(res[3].b).toEqual('%C3%A9%20cinq');
                done();
            });
    });
});
describe('$REPLACE', () => {
    test('with valid parameter', (done) => {
        const script = `
            [$REPLACE]
            path = b
            value = un
            value = 1

            [exchange]
            value = omit('$origin')
        `;
        const res = [];
        from([
            { a: 1, b: 'un deux', c: true },
            { a: 2, b: 'un trois', c: true },
            { a: 3, b: 'un quatre', c: false },
            { a: 4, b: 'un cinq', c: true },
        ])
            .pipe(ezs('delegate', { script }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                expect(chunk).toEqual(expect.any(Object));
                res.push(chunk);
            })
            .on('end', () => {
                expect(res.length).toBe(4)
                expect(res[0].b).toEqual('1 deux');
                expect(res[1].b).toEqual('1 trois');
                expect(res[2].b).toEqual('1 quatre');
                expect(res[3].b).toEqual('1 cinq');
                done();
            });
    });
});
