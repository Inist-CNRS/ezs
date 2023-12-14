import ezs from '@ezs/core/src';
import from from 'from';
import assert from 'assert';
import value from '../src/value';

ezs.addPath(__dirname);

const runEzs = (ezsRuntime, dataSet, path) => new Promise((resolve) => {
    const result = [];
    from(dataSet)
        .pipe(ezsRuntime('value', { path }))
        .on('data', (chunk) => {
            assert(typeof chunk === 'object');
            result.push(chunk);
        })
        .on('end', () => {
            resolve(result);
        });
});

describe('value', () => {
    describe('simple data', () => {
        const simpleData =  [
            {
                'id': 1,
                'value': 1
            },
            {
                'id': 2,
                'value': 2
            }
        ];

        it('should extract the id (path = id)', async () => {
            ezs.use({ value });
            const result = await runEzs(ezs, simpleData, 'id');

            assert.equal(result.length, 2);

            assert.equal(result[0], 1);
            assert.equal(result[1], 2);
        });

        it('should extract the value (path = value)', async () => {
            ezs.use({ value });
            const result = await runEzs(ezs, simpleData, 'value');

            assert.equal(result.length, 2);

            assert.equal(result[0], 1);
            assert.equal(result[1], 2);
        });
    });

    describe('array data', () => {
        const arrayData =  [
            {
                'id': 1,
                'value': [1, 1]
            },
            {
                'id': 2,
                'value': [2, 2]
            }
        ];

        it('should extract the id (path = id)', async () => {
            ezs.use({ value });
            const result = await runEzs(ezs, arrayData, 'id');

            assert.equal(result.length, 2);

            assert.equal(result[0], 1);
            assert.equal(result[1], 2);
        });

        it('should extract the value (path = value)', async () => {
            ezs.use({ value });
            const result = await runEzs(ezs, arrayData, 'value');

            assert.equal(result.length, 2);

            assert.equal(result[0], [1, 1]);
            assert.equal(result[1], [2, 2]);
        });
    });

    describe('object data', () => {
        const objectData =  [
            {
                'id': 1,
                'value': {
                    'a': 1
                }
            },
            {
                'id': 2,
                'value': {
                    'b': 2
                }
            }
        ];

        it('should extract the id (path = id)', async () => {
            ezs.use({ value });
            const result = await runEzs(ezs, objectData, 'id');

            assert.equal(result.length, 2);

            assert.equal(result[0], 1);
            assert.equal(result[1], 2);
        });

        it('should extract the value (path = value)', async () => {
            ezs.use({ value });
            const result = await runEzs(ezs, objectData, 'value');

            assert.equal(result.length, 2);

            assert.equal(result[0], { a: 1 });
            assert.equal(result[1], { a: 2 });
        });
    });

    describe('deep object data', () => {
        const deepObjectData =  [
            {
                'id': 1,
                'value': {
                    'a': 1,
                    'b': {
                        'a': '1',
                        'b': 1,
                        'c': 0.0014,
                        'd': {
                            'a': '1',
                        }
                    },
                    'c': [1, 2],
                    'd': [1.0002, 0.0057, 1000.100056]
                }
            },
            {
                'id': 2,
                'value': {
                    'a': 2,
                    'b': {
                        'a': '2',
                        'b': 2,
                        'c': 0.0028,
                        'd': {
                            'a': '2',
                        }
                    },
                    'c': [2, 4],
                    'd': [2.0004, 0.0114, 2000.200112]
                }
            }
        ];

        it('should extract the id (path = id)', async () => {
            ezs.use({ value });
            const result = await runEzs(ezs, deepObjectData, 'id');

            assert.equal(result.length, 2);

            assert.equal(result[0], 1);
            assert.equal(result[1], 2);
        });

        it('should extract the value (path = value)', async () => {
            ezs.use({ value });
            const result = await runEzs(ezs, deepObjectData, 'value');

            assert.equal(result.length, 2);

            assert.equal(result[0], {
                a: 1,
                b: {
                    a: '1',
                    b: 1,
                    c: 0.0014,
                    d: {
                        a: '1',
                    }
                },
                c: [1, 2],
                d: [1.0002, 0.0057, 1000.100056]
            });
            assert.equal(result[1], {
                a: 2,
                b: {
                    a: '2',
                    b: 2,
                    c: 0.0028,
                    d: {
                        a: '2',
                    }
                },
                c: [2, 4],
                d: [2.0004, 0.0114, 2000.200112]
            });
        });
    });
});