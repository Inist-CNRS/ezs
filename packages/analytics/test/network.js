import assert from 'assert';
import from from 'from';
import ezs from '../../core/src';
import statements from '../src';

ezs.addPath(__dirname);

describe('network', () => {
    it('graph #1', (done) => {
        ezs.use(statements);
        const res = [];
        from([
            { a: ['x', 'b', 'z'] },
            { a: ['t', 'b', 'z'] },
            { a: ['t', 'c', 'z'] },
            { a: ['y', 'd', 'z'] },
            { a: ['x', 'b', 'z'] },
        ])
            .pipe(ezs('graph', { path: 'a' }))
            .pipe(ezs('reducing'))
            .pipe(ezs('summing'))
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(10, res.length);
                assert.equal(2, res[1].value);
                done();
            });
    });

    it('graph #2', (done) => {
        ezs.use(statements);
        const res = [];
        from([
            { i: 'doc#1', a: ['x', 'b', 'z'] },
            { i: 'doc#2', a: ['t', 'b', 'z'] },
            { i: 'doc#3', a: ['t', 'c', 'z'] },
            { i: 'doc#4', a: ['y', 'd', 'z'] },
            { i: 'doc#5', a: ['x', 'b', 'z'] },
        ])
            .pipe(ezs('graph', { path: 'a', identifier: 'i' }))
            .pipe(ezs('reducing'))
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(10, res.length);
                assert.equal(2, res[1].value.length);
                done();
            });
    });


    it('segment #3', (done) => {
        ezs.use(statements);
        const res = [];
        from([
            {
                id: 'doc#1',
                value: [
                    1,
                    2,
                    3,
                    4,
                ],
            },
            {
                id: 'doc#2',
                value: [
                    4,
                    5,
                    6,
                ],
            },
            {
                id: 'doc#3',
                value: 6,
                valueBis: 7,
            },
            {
                id: 'doc#4',
                value: [
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7,
                ],
            },
        ])
            .pipe(ezs('segment', { path: ['value', 'valueBis'], identifier: 'id' }))
            .pipe(ezs('reducing'))
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(6, res.length);
                assert.equal(1, res[0].id[0]);
                assert.equal(2, res[0].id[1]);
                assert.equal(2, res[0].value.length);
                assert.equal(2, res[5].value.length);
                done();
            });
    });


    it('segment #1', (done) => {
        ezs.use(statements);
        const res = [];
        from([
            {
                id: 'doc#1',
                value: [
                    1,
                    2,
                    3,
                    4,
                ],
            },
            {
                id: 'doc#2',
                value: [
                    4,
                    5,
                    6,
                ],
            },
            {
                id: 'doc#3',
                value: 6,
                valueBis: 7,
            },
            {
                id: 'doc#4',
                value: [
                    1,
                    2,
                    3,
                    4,
                    5,
                    6,
                    7,
                ],
            },
        ])
            .pipe(ezs('segment', { path: ['value', 'valueBis'] }))
            .pipe(ezs('reducing'))
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(6, res.length);
                assert.equal(1, res[0].id[0]);
                assert.equal(2, res[0].id[1]);
                assert.equal(2, res[0].value.length);
                assert.equal(2, res[5].value.length);
                done();
            });
    });

    it('segment #2', (done) => {
        ezs.use(statements);
        const res = [];
        from([
            {
                id: 'doc#1',
                a: [1, 2, 3],
                b: [1, 2, 4],
            },
            {
                id: 'doc#2',
                a: [1, 2, 4],
                b: [1, 2, 4],
            },
            {
                id: 'doc#3',
                c: [
                    [1, 2, 6],
                    [1, 2, 7],
                ],
            },
            {
                id: 'doc#4',
                a: [1, 2, 3],
                b: [1, 2, 7],
            },
        ])
            .pipe(ezs('segment', { aggregate: false, path: ['a', 'b', 'c'] }))
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(1, res[0].id[0]);
                assert.equal(2, res[0].id[1]);
                assert.equal(2, res[1].id[0]);
                assert.equal(3, res[1].id[1]);
                assert.equal(1, res[2].id[0]);
                assert.equal(2, res[2].id[1]);
                assert.equal(16, res.length);
                done();
            });
    });

    it('pair #1', (done) => {
        ezs.use(statements);
        const res = [];
        from([
            { a: ['x', 'r', 'z'], b: ['a', 'b', 'c'] },
            { a: ['t', 'r', 'z'], b: ['e', 'i', 'e'] },
            { a: ['t', 's', 'z'], b: ['i', 'c', 'e'] },
            { a: ['y', 'w', 'z'], b: ['o', 'c', 'd'] },
            { a: ['x', 's', 'z'], b: ['u', 'e', 'd'] },
        ])
            .pipe(ezs('pair', { path: 'a' }))
            .pipe(ezs('reducing'))
            .pipe(ezs('summing'))
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(0, res.length);
                done();
            });
    });

    it('pair #2', (done) => {
        ezs.use(statements);
        const res = [];
        from([
            { a: ['x', 'r', 'z'], b: ['a', 'b', 'c'] },
            { a: ['t', 'r', 'z'], b: ['e', 'i', 'e'] },
            { a: ['t', 's', 'z'], b: ['i', 'c', 'e'] },
            { a: ['y', 'w', 'z'], b: ['o', 'c', 'd'] },
            { a: ['x', 's', 'z'], b: ['u', 'e', 'd'] },
        ])
            .pipe(ezs('pair', { path: ['a', 'b'] }))
            .pipe(ezs('reducing'))
            .pipe(ezs('summing'))
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(33, res.length);
                done();
            });
    });

    it('pair #3', (done) => {
        ezs.use(statements);
        const res = [];
        from([
            { i: 'doc#1', a: ['x', 'b', 'z'], b: 'A' },
            { i: 'doc#2', a: ['t', 'b', 'z'], b: 'B' },
            { i: 'doc#3', a: ['t', 'c', 'z'], b: 'C' },
            { i: 'doc#4', a: ['y', 'd', 'z'], b: 'D' },
            { i: 'doc#5', a: ['x', 'b', 'z'], b: 'E' },
        ])
            .pipe(ezs('pair', { path: ['a', 'b'], identifier: 'i' }))
            .on('data', (chunk) => {
                assert(typeof chunk === 'object');
                res.push(chunk);
            })
            .on('end', () => {
                assert.equal(15, res.length);
                assert.equal('doc#1', res[0].value);
                done();
            });
    });



});
