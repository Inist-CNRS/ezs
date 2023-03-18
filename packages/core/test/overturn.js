import from from 'from';
import ezs from '../src';

ezs.addPath(__dirname);

ezs.use(require('./locals'));

test('overturn all values #1', (done) => {
    const input = [
        { a: 1, b: 'a' },
        { a: 2, b: 'b' },
        { a: 3, b: 'c' },
        { a: 4, b: 'd' },
        { a: 5, b: 'e' },
        { a: 6, b: 'f' },
    ];
    const env = { count: 0 };
    const output = [];
    const script = `
            [use]
            plugin = analytics

            [env]
            path = count
            value = env('count').thru(x => x + 1)

            [assign]
            path = value
            value = get('value').repeat(2)
        `;
    from(input)
        .pipe(ezs('overturn', { path: 'b', script }, env))
        .pipe(ezs.catch())
        .on('error', done)
        .on('data', (chunk) => {
            output.push(chunk);
        })
        .on('end', () => {
            expect(output.length).toEqual(6);
            expect(output[0].b).toEqual('aaaa');
            expect(output[1].b).toEqual('bbbb');
            expect(output[2].b).toEqual('cccc');
            expect(output[3].b).toEqual('dddd');
            expect(output[4].b).toEqual('eeee');
            expect(output[5].b).toEqual('ffff');
            expect(env.count).toEqual(12);
            done();
        });
});

test('overturn all values #2', (done) => {
    const input = [
        { a: 1, b: 'abc' },
        { a: 2, b: 'bcd' },
        { a: 3, b: 'cde' },
        { a: 4, b: 'def' },
        { a: 5, b: 'efg' },
        { a: 6, b: 'fgh' },
    ];
    const env = { count: 0 };
    const output = [];
    const script = `
            [use]
            plugin = analytics

            [env]
            path = count
            value = env('count').thru(x => x + 1)
            [assign]
            path = value
            value = get('value').split('').reverse().join('')
        `;
    from(input)
        .pipe(ezs('overturn', { path: 'b', script }, env))
        .pipe(ezs.catch())
        .on('error', done)
        .on('data', (chunk) => {
            output.push(chunk);
        })
        .on('end', () => {
            expect(output.length).toEqual(6);
            expect(output[0].b).toEqual('abc');
            expect(output[1].b).toEqual('bcd');
            expect(output[2].b).toEqual('cde');
            expect(output[3].b).toEqual('def');
            expect(output[4].b).toEqual('efg');
            expect(output[5].b).toEqual('fgh');
            expect(env.count).toEqual(12);
            done();
        });
});

test('overturn all values #3', (done) => {
    const input = [
        { a: 1, b: 'a' },
        { a: 2, b: 'b' },
        { a: 3, b: 'c' },
        { a: 3, d: false },
        { a: 4, b: 'd' },
        { a: 5, b: 'e' },
        { a: 6, b: 'f' },
    ];
    const env = { count: 0 };
    const output = [];
    const script = `
            [use]
            plugin = analytics

            [env]
            path = count
            value = env('count').thru(x => x + 1)

            [assign]
            path = value
            value = get('value').repeat(2)
        `;
    from(input)
        .pipe(ezs('overturn', { path: 'b', script }, env))
        .pipe(ezs.catch())
        .on('error', done)
        .on('data', (chunk) => {
            output.push(chunk);
        })
        .on('end', () => {
            expect(output.length).toEqual(7);
            expect(output[0].d).toEqual(false);
            expect(output[1].b).toEqual('aaaa');
            expect(output[2].b).toEqual('bbbb');
            expect(output[3].b).toEqual('cccc');
            expect(output[4].b).toEqual('dddd');
            expect(output[5].b).toEqual('eeee');
            expect(output[6].b).toEqual('ffff');
            expect(env.count).toEqual(12);
            done();
        });
});

test('overturn one side (verso) #1', (done) => {
    const input = [
        { a: 1, b: 'abc' },
        { a: 2, b: 'bcd' },
        { a: 3, b: 'cde' },
        { a: 4, b: 'def' },
        { a: 5, b: 'efg' },
        { a: 6, b: 'fgh' },
    ];
    const env = { count: 0 };
    const output = [];
    const script = `
            [use]
            plugin = analytics

            [env]
            path = count
            value = env('count').thru(x => x + 1)

            [drop]
            path = token.1
            if = 0

            [assign]
            path = value
            value = get('value').split('').reverse().join('')
        `;
    from(input)
        .pipe(ezs('overturn', { path: 'b', script }, env))
        .pipe(ezs.catch())
        .on('error', done)
        .on('data', (chunk) => {
            output.push(chunk);
        })
        .on('end', () => {
            expect(output.length).toEqual(6);
            expect(output[0].b).toEqual('cba');
            expect(output[1].b).toEqual('dcb');
            expect(output[2].b).toEqual('edc');
            expect(output[3].b).toEqual('fed');
            expect(output[4].b).toEqual('gfe');
            expect(output[5].b).toEqual('hgf');
            expect(env.count).toEqual(12);
            done();
        });
});

test('with a buggy script', (done) => {
    const input = [
        { a: 1, b: 'a' },
        { a: 2, b: 'b' },
        { a: 3, b: 'c' },
        { a: 4, b: 'd' },
        { a: 5, b: 'e' },
        { a: 6, b: 'f' },
    ];
    const output = [];
    const script = `
            [assign]
            path = value
            value = get(BADVAL).toUpper()
        `;

    from(input)
        .pipe(ezs('overturn', { path: 'b', script }))
        .pipe(ezs.catch())
        .on('data', (chunk) => {
            output.push(chunk);
        })
        .on('error', (e) => {
            expect(e.message).toEqual(expect.stringContaining('BADVAL is not defined'));
            expect(output.length).toEqual(0);
            done();
        })
        .on('end', () => {
            done(new Error('Error is the right behavior'));
        });
});

