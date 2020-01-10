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
    it('with no batch', (done) => {
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
    it('with batch', (done) => {
        const input = [...data];
        const output = [];
        from(input)
            .pipe(ezs('keep', { path: ['a', 'b'] }))
            .pipe(ezs('identify', { batch: '123' }))
            .pipe(ezs('extract', { path: 'uri' }))
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                assert.equal(output.length, 6);
                assert.equal(output[0].indexOf('uid:'), 0);
                assert.equal(output[0].indexOf('123-'), 5);
                done();
            });
    });

    it('with batch too long', (done) => {
        const input = [...data];
        const output = [];
        from(input)
            .pipe(ezs('keep', { path: ['a', 'b'] }))
            .pipe(ezs('identify', { batch: '12345' }))
            .pipe(ezs('extract', { path: 'uri' }))
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                assert.equal(output.length, 6);
                assert.equal(output[0].indexOf('uid:'), 0);
                assert.equal(output[0].indexOf('123-'), 5);
                assert.equal(output[0].indexOf('12345'), -1);
                done();
            });
    });

    it('with batch too short', (done) => {
        const input = [...data];
        const output = [];
        from(input)
            .pipe(ezs('keep', { path: ['a', 'b'] }))
            .pipe(ezs('identify', { batch: '12' }))
            .pipe(ezs('extract', { path: 'uri' }))
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                assert.equal(output.length, 6);
                assert.equal(output[0].indexOf('uid:'), 0);
                assert.equal(output[0].indexOf('12'), 5);
                assert.equal(output[0].indexOf('12-'), -1);
                assert.equal(output[0][8], '-');
                done();
            });
    });

    it('with batch with wrong type', (done) => {
        const input = [...data];
        const output = [];
        from(input)
            .pipe(ezs('keep', { path: ['a', 'b'] }))
            .pipe(ezs('identify', { batch: 123 }))
            .pipe(ezs('extract', { path: 'uri' }))
            .on('data', (chunk) => {
                output.push(chunk);
            })
            .on('end', () => {
                assert.equal(output.length, 6);
                assert.equal(output[0].indexOf('uid:'), 0);
                assert.equal(output[0].indexOf('123-'), 5);
                done();
            });
    });
});

describe('save', () => {
    it('with object', (done) => {
        const input = [...data];
        from(input)
            .pipe(ezs('identify', { batch: 'ezs' }))
            .pipe(ezs('save', { reset: true }))
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
            .pipe(ezs('load'))
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
            .pipe(ezs('flow', { batch: 'ezs' }))
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
