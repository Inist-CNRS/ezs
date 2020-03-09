import assert from 'assert';
import from from 'from';
import ezs from '../../core/src';
import statements from '../src';

ezs.use(statements);

const identifiers = [];
const data = [
    { a: 1, b: 'a' },
    { a: 2, b: 'b' },
    { a: 3, b: 'c', uri: 'uid:/ezs-5KB8aAA4-p' },
    { a: 4, b: 'd' },
    { a: 5, b: 'e' },
    { a: 6, b: 'f', uri: 'uid:/ezs-V9neThkw-e' },
];
describe('identify', () => {
    it('with no uri #1', (done) => {
        const input = [...data];
        const output = [];
        from(input)
            .pipe(ezs('keep', { path: ['a', 'b'] }))
            .pipe(ezs('identify'))
            .pipe(ezs('extract', { path: 'uri' }))
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                assert.equal(output.length, 6);
                assert.equal(output[0].indexOf('uid:'), 0);
                done();
            });
    });
    it('with no uri #2', (done) => {
        const input = [...data];
        const output = [];
        from(input)
            .pipe(ezs('keep', { path: ['a', 'b'] }))
            .pipe(ezs('identify', { path: ['_id', 'id'] }))
            .pipe(ezs('extract', { path: '_id' }))
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                assert.equal(output.length, 6);
                assert.equal(output[0].indexOf('uid:'), 0);
                done();
            });
    });
    it('with no uri #3', (done) => {
        const input = [...data];
        const output = [];
        from(input)
            .pipe(ezs('keep', { path: ['a', 'b'] }))
            .pipe(ezs('identify', { scheme: 'toto' }))
            .pipe(ezs('extract', { path: 'uri' }))
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                assert.equal(output.length, 6);
                assert.equal(output[0].indexOf('toto:'), 0);
                done();
            });
    });
});

describe('save', () => {
    it('with object', (done) => {
        const input = [...data];
        from(input)
            .pipe(ezs('identify'))
            .pipe(ezs('save', { domain: 'test', reset: true, host: false }))
            .on('data', (chunk) => {
                identifiers.push(chunk);
            })
            .on('end', () => {
                assert.equal(identifiers.length, 6);
                assert.equal(identifiers[0].indexOf('uid:'), 0);
                done();
            });
    });

    it('with invalid object', (done) => {
        const input = [
            { a: 1 },
            { a: 1 },
            { a: 1 },
        ];
        const result = [];
        from(input)
            .pipe(ezs('save', {
                domain: ['test2', 'test4'], // only the first
                reset: true,
                host: false,
                path: ['uri', 'id'], // only the first
            }))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 0);
                done();
            });
    });

    it('with object to get URL', (done) => {
        const input = [...data];
        const result = [];
        from(input)
            .pipe(ezs('identify'))
            .pipe(ezs('save', { domain: 'test3', reset: true }))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                assert.equal(result.length, 6);
                expect(result[0]).toMatch(':31976');
                expect(result[1]).toMatch(':31976');
                expect(result[2]).toMatch(':31976');
                done();
            });
    });
});
describe('load', () => {
    it('with uid #1', (done) => {
        const input = [...identifiers];
        const output = [];
        from(input)
            .pipe(ezs('load', { domain: 'test' }))
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                expect(output.length).toEqual(6);
                expect(output[0]).toEqual(data[0]);
                done();
            });
    });
    it('with uid #2', (done) => {
        const input = [...identifiers];
        const output = [];
        from(input)
            .pipe(ezs('load', { domain: 'test' }))
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                expect(output.length).toEqual(6);
                expect(output[0]).toEqual(data[0]);
                done();
            });
    });
    it('with uid #3', (done) => {
        const input = [...identifiers];
        const output = [];
        from(input)
            .pipe(ezs('load', { domain: 'test' }))
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                expect(output.length).toEqual(6);
                expect(output[0]).toEqual(data[0]);
                done();
            });
    });

    it('with invalid uri', (done) => {
        const input = [1, 2, 3, 4];
        const output = [];
        from(input)
            .pipe(ezs('load', { domain: 'test2' }))
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                expect(output.length).toEqual(0);
                done();
            });
    });
});
describe('flow', () => {
    it('with no options', (done) => {
        const input = [{ }];
        const output = [];
        from(input)
            .pipe(ezs('flow', { domain: 'test' }))
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                expect(output.length).toEqual(6);
                expect(output.sort((x, y) => x.a - y.a).shift()).toEqual(data[0]);
                done();
            });
    });
    it('with options', (done) => {
        const input = [{ }];
        const output = [];
        from(input)
            .pipe(ezs('flow', { domain: 'test', length: 2 }))
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                expect(output.length).toEqual(2);
                done();
            });
    });
    it('save & flow', (done) => {
        const input = [...data];
        const ids = [];
        const output = [];
        from(input)
            .pipe(ezs('identify'))
            .pipe(ezs('save', { domain: 'test2', reset: true, host: false }))
            .on('data', (chunk) => {
                ids.push(chunk);
            })
            .on('end', () => {
                assert.equal(ids.length, 6);
                assert.equal(ids[0].indexOf('uid:'), 0);
                from(['GO'])
                    .pipe(ezs('flow', { domain: 'test2' }))
                    .on('data', (chunk) => {
                        output.push(chunk);
                    })
                    .on('end', () => {
                        expect(output.length).toEqual(6);
                        expect(output.sort((x, y) => x.a - y.a).shift()).toEqual(input[0]);
                        done();
                    });
            });
    });
});
