import ezs from '@ezs/core/src';
import from from 'from';
import assert from 'assert';
import value from '../src/value';

ezs.addPath(__dirname);

describe('value', () => {
    const runEzs = (ezsRuntime, dataSet, path) => new Promise((resolve) => {
        const result = [];
        from(dataSet)
            .pipe(ezsRuntime('value', { path }))
            .on('data', (chunk) => {
                result.push(chunk);
            })
            .on('end', () => {
                resolve(result);
            });
    });

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

            assert.deepStrictEqual(result.length, 2);

            assert.deepStrictEqual(result[0], 1);
            assert.deepStrictEqual(result[1], 2);
        });

        it('should extract the value (path = value)', async () => {
            ezs.use({ value });
            const result = await runEzs(ezs, simpleData, 'value');

            assert.deepStrictEqual(result.length, 2);

            assert.deepStrictEqual(result[0], 1);
            assert.deepStrictEqual(result[1], 2);
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

            assert.deepStrictEqual(result.length, 2);

            assert.deepStrictEqual(result[0], 1);
            assert.deepStrictEqual(result[1], 2);
        });

        it('should extract the value (path = value)', async () => {
            ezs.use({ value });
            const result = await runEzs(ezs, arrayData, 'value');

            assert.deepStrictEqual(result.length, 2);

            assert.deepStrictEqual(result[0], [1, 1]);
            assert.deepStrictEqual(result[1], [2, 2]);
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

            assert.deepStrictEqual(result.length, 2);

            assert.deepStrictEqual(result[0], 1);
            assert.deepStrictEqual(result[1], 2);
        });

        it('should extract the value (path = value)', async () => {
            ezs.use({ value });
            const result = await runEzs(ezs, objectData, 'value');

            assert.deepStrictEqual(result.length, 2);

            assert.deepStrictEqual(result[0], { a: 1 });
            assert.deepStrictEqual(result[1], { b: 2 });
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

            assert.deepStrictEqual(result.length, 2);

            assert.deepStrictEqual(result[0], 1);
            assert.deepStrictEqual(result[1], 2);
        });

        it('should extract the value (path = value)', async () => {
            ezs.use({ value });
            const result = await runEzs(ezs, deepObjectData, 'value');

            assert.deepStrictEqual(result.length, 2);

            assert.deepStrictEqual(result[0], {
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
            assert.deepStrictEqual(result[1], {
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

    // https://github.com/Inist-CNRS/lodex-use-cases/tree/master/animalia100
    // Special cases that have been problematic in a specific condition
    describe('animalia100 data', () => {
        const animalia100Data = [
            {
                id: '0000000000000000000.02702702702702702506',
                value: {
                    id: ['uid:/0579J7JN', 'uid:/KRVCJDGF'],
                    value: 0.027027027027027025,
                    values: [0, 0.05405405405405405],
                },
            },
            {
                id: '0000000000000000000.03571428571428571924',
                value: {
                    id: ['uid:/0579J7JN', 'uid:/JW63WRFP'],
                    value: 0.03571428571428572,
                    values: [0, 0.07142857142857144],
                },
            },
            {
                id: '0000000000000000000.07142857142857143848',
                value: {
                    id: ['uid:/0579J7JN', 'uid:/WC0F9P1S'],
                    value: 0.07142857142857144,
                    values: [0, 0.14285714285714288],
                },
            },
            {
                id: '0000000000000000000.08333333333333334259',
                value: {
                    id: ['uid:/0579J7JN', 'uid:/J9N9N456'],
                    value: 0.08333333333333334,
                    values: [0.16666666666666669, 0],
                },
            },
            {
                id: '0000000000000000000.08333333333333334259',
                value: {
                    id: ['uid:/0579J7JN', 'uid:/V572XQCD'],
                    value: 0.08333333333333334,
                    values: [0.16666666666666669, 0],
                },
            },
        ];

        it('should extract the id (path = id)', async () => {
            ezs.use({ value });
            const result = await runEzs(ezs, animalia100Data, 'id');

            assert.deepStrictEqual(result.length, 5);

            assert.deepStrictEqual(result[0], '0000000000000000000.02702702702702702506');
            assert.deepStrictEqual(result[1], '0000000000000000000.03571428571428571924');
            assert.deepStrictEqual(result[2], '0000000000000000000.07142857142857143848');
            assert.deepStrictEqual(result[3], '0000000000000000000.08333333333333334259');
            assert.deepStrictEqual(result[4], '0000000000000000000.08333333333333334259');
        });

        it('should extract the value (path = value)', async () => {
            ezs.use({ value });
            const result = await runEzs(ezs, animalia100Data, 'value');

            assert.deepStrictEqual(result.length, 5);

            assert.deepStrictEqual(result[0], {
                id: ['uid:/0579J7JN', 'uid:/KRVCJDGF'],
                value: 0.027027027027027025,
                values: [0, 0.05405405405405405],
            });
            assert.deepStrictEqual(result[1], {
                id: ['uid:/0579J7JN', 'uid:/JW63WRFP'],
                value: 0.03571428571428572,
                values: [0, 0.07142857142857144],
            });
            assert.deepStrictEqual(result[2], {
                id: ['uid:/0579J7JN', 'uid:/WC0F9P1S'],
                value: 0.07142857142857144,
                values: [0, 0.14285714285714288],
            });
            assert.deepStrictEqual(result[3], {
                id: ['uid:/0579J7JN', 'uid:/J9N9N456'],
                value: 0.08333333333333334,
                values: [0.16666666666666669, 0],
            });
            assert.deepStrictEqual(result[4], {
                id: ['uid:/0579J7JN', 'uid:/V572XQCD'],
                value: 0.08333333333333334,
                values: [0.16666666666666669, 0],
            });
        });
    });

    describe('genrated data', () => {
        const LENGHT = 1000;
        let genratedData =  [];

        beforeEach(() => {
            const data = [];
            for (let i = 0; i < LENGHT; i += 1) {
                data.push({
                    id: i,
                    value: i * 2,
                });
            }
            genratedData = data;
        });

        it('should extract the id (path = id)', async () => {
            ezs.use({ value });
            const result = await runEzs(ezs, genratedData, 'id');

            assert.deepStrictEqual(result.length, LENGHT);

            for (let i = 0; i < LENGHT; i += 1) {
                assert.deepStrictEqual(result[i], i);
            }
        });

        it('should extract the value (path = value)', async () => {
            ezs.use({ value });
            const result = await runEzs(ezs, genratedData, 'value');

            assert.deepStrictEqual(result.length, LENGHT);

            for (let i = 0; i < LENGHT; i += 1) {
                assert.deepStrictEqual(result[i], i * 2);
            }
        });
    });
});
