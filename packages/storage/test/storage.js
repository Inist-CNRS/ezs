import assert from 'assert';
import from from 'from';
import getStream from 'get-stream';
import ezs from '../../core/src';
import statements from '../src';

ezs.use(statements);

const data = [
    { a: 1, b: 'a' },
    { a: 2, b: 'b' },
    { a: 3, b: 'c' },
    { a: 4, b: 'd' },
    { a: 5, b: 'e' },
    { a: 6, b: 'f' },
];

describe('storage:', () => {
    it('save and load #1', (done) => {
        const input = [...data];
        const output = [];
        const script = `

        [save]
        path = a
        domain = test1
        reset = true

        [replace]
        path = a
        value = get('a')

        [load]
        path = a
        domain = test1
        `;
        from(input)
            .pipe(ezs('delegate', { script }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                expect(output).toEqual(input);
                done();
            });
    });

    it('save and load #2', (done) => {
        const input = [...data];
        const output = [];
        const script = `

        [save]
        path = a
        path = to ignore
        domain = test2
        domain = to ignore
        reset = true

        [replace]
        path = a
        value = get('a')

        [load]
        path = a
        path = to ignore
        domain = test2
        domain = to ignore
        target = c

        [exchange]
        value = get('c')
        `;
        from(input)
            .pipe(ezs('delegate', { script }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                expect(output).toEqual(input);
                done();
            });
    });


    it('save without uid (ignored)', (done) => {
        const input = [...data];
        const output = [];
        const script = `

        [save]
        path = x
        domain = test

        `;
        from(input)
            .pipe(ezs('delegate', { script }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                expect(output).toEqual(input);
                done();
            });
    });

    it('load without uid (ignored)', (done) => {
        const input = [...data];
        const output = [];
        const script = `

        [load]
        path = x
        domain = test

        `;
        from(input)
            .pipe(ezs('delegate', { script }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                expect(output).toEqual(input);
                done();
            });
    });

    it('load with unknown uid (empty)', (done) => {
        const input = [...data];
        const output = [];
        const script = `

        [load]
        path = b
        domain = test
        [debug]

        `;
        from(input)
            .pipe(ezs('delegate', { script }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                expect(output.length).toEqual(0);
                done();
            });
    });

    it('save and cast', (done) => {
        const input = [...data];
        const output = [];
        const script = `

        [save]
        path = a
        domain = test3
        reset = true

        [pop]

        [cast]
        domain = test1
        `;
        from(input)
            .pipe(ezs('delegate', { script }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                expect(output).toEqual(input);
                done();
            });
    });

    it('save and clean', (done) => {
        const input = [...data];
        const output = [];
        const script = `

        [save]
        path = a
        domain = test3
        reset = true

        [pop]

        [cast]
        domain = test3
        domain = to ignore
        clean = true


        `;
        from(input)
            .pipe(ezs('delegate', { script }))
            .pipe(ezs.catch())
            .on('error', done)
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', async () => {
                expect(output).toEqual(input);
                const output2 = await getStream(from(['GO']).pipe(ezs('cast', {domain: 'test3'})));
                expect(output2.length).toEqual(0);
                done();
            });
    });


});
