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
            .pipe(ezs('identify', { path: '_id' }))
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
            .pipe(ezs('identify', { scheme : 'toto' }))
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
            .pipe(ezs('save', { batch: 'test', reset: true }))
            .on('data', (chunk) => {
                identifiers.push(chunk);
            })
            .on('end', () => {
                assert.equal(identifiers.length, 6);
                assert.equal(identifiers[0].indexOf('uid:'), 0);
                done();
            });
    });
});
describe('load', () => {
    it('with uid', (done) => {
        const input = [...identifiers];
        const output = [];
        from(input)
            .pipe(ezs('load', { batch: 'test' }))
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                expect(output.length).toEqual(6);
                expect(output[0]).toEqual(data[0]);
                done();
            });
    });
});
describe('flow', () => {
    it('with no options', (done) => {
        const input = [{ }];
        const output = [];
        from(input)
            .pipe(ezs('flow', { batch: 'test' }))
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
            .pipe(ezs('flow', { batch: 'ezs', length: 2 }))
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                expect(output.length).toEqual(2);
                done();
            });
    });
});
