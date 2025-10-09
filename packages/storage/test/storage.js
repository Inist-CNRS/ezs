import from from 'from';
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

    it('save and load #2bis (not found)', (done) => {
        const input = [...data];
        const output = [];
        const script = `

        [save]
        path = a
        path = to ignore
        domain = test2b
        domain = to ignore
        reset = true

        [replace]
        path = a
        value = get('a').append('~')

        [load]
        path = a
        domain = test2b
        target = c

        [remove]
        test = get('c').isEmpty()

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
                expect(output.sort((x, y) => (x.a > y.a) ? 1 : -1)).toEqual(input);
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
            .on('end', () => {
                expect(output.sort((x, y) => (x.a > y.a) ? 1 : -1)).toEqual(input);
                const output2 = [];
                from(['GO'])
                    .pipe(ezs('cast', {domain: 'test3'}))
                    .pipe(ezs.catch())
                    .on('error', done)
                    .on('data', (chunk) => {
                        output2.push(chunk);
                    })
                    .on('end', () => {
                        expect(output2.length).toEqual(0);
                        done();
                    });
            });
    });

    it('fordiden cast', (done) => {
        const input = [...data];
        const script = `

        [cast]
        domain = fake
        location = /etc
        clean = true

        `;
        from(input)
            .pipe(ezs('delegate', { script }))
            .pipe(ezs.catch())
            .on('error', (e) => {
                expect(e.message).toEqual(expect.stringContaining('permission denied'));
                done();
            })
            .on('data', () => true)
            .on('end', () => {
                done(new Error('Error is the right behavior'));
            });
    });

    it('fordiden save', (done) => {
        const input = [...data];
        const script = `

        [save]
        domain = fake
        location = /etc
        clean = true

        `;
        from(input)
            .pipe(ezs('delegate', { script }))
            .pipe(ezs.catch())
            .on('error', (e) => {
                expect(e.message).toEqual(expect.stringContaining('permission denied'));
                done();
            })
            .on('data', () => true)
            .on('end', () => {
                done(new Error('Error is the right behavior'));
            });
    });

    it('fordiden load ', (done) => {
        const input = [...data];
        const script = `

        [load]
        domain = fake
        location = /etc
        clean = true
        path = a

        `;
        from(input)
            .pipe(ezs('delegate', { script }))
            .pipe(ezs.catch())
            .on('error', (e) => {
                expect(e.message).toEqual(expect.stringContaining('permission denied'));
                done();
            })
            .on('data', () => true)
            .on('end', () => {
                done(new Error('Error is the right behavior'));
            });
    });

});
