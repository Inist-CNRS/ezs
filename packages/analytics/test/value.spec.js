import ezs from '../../core/src';
import value from '../src/value';
import runEzs from '../test-utils/runEzs';

ezs.addPath(__dirname);

describe('value', () => {
    describe('simple data', () => {
        const simpleData =  [
            {
                'id': 1,
                'value': 3
            },
            {
                'id': 2,
                'value': 4
            }
        ];

        it('should extract the id (path = id)', async () => {
            ezs.use({ value });
            const result = await runEzs(ezs, simpleData, 'value', { path: 'id' });

            expect(result).toHaveLength(2);

            expect(result[0]).toStrictEqual(1);
            expect(result[1]).toStrictEqual(2);
        });

        it('should extract the value (path = value)', async () => {
            ezs.use({ value });
            const result = await runEzs(ezs, simpleData, 'value', { path: 'value' });

            expect(result).toHaveLength(2);

            expect(result[0]).toStrictEqual(3);
            expect(result[1]).toStrictEqual(4);
        });

        it('should extract the value (path = undefined)', async () => {
            ezs.use({ value });
            const result = await runEzs(ezs, simpleData, 'value');

            expect(result).toHaveLength(2);

            expect(result[0]).toStrictEqual(3);
            expect(result[1]).toStrictEqual(4);
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
            const result = await runEzs(ezs, arrayData, 'value', { path: 'id' });

            expect(result).toHaveLength(2);

            expect(result[0]).toStrictEqual(1);
            expect(result[1]).toStrictEqual(2);
        });

        it('should extract the value (path = value)', async () => {
            ezs.use({ value });
            const result = await runEzs(ezs, arrayData, 'value', { path: 'value' });

            expect(result).toHaveLength(2);

            expect(result[0]).toStrictEqual([1, 1]);
            expect(result[1]).toStrictEqual([2, 2]);
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
            const result = await runEzs(ezs, objectData, 'value', { path: 'id' });

            expect(result).toHaveLength(2);

            expect(result[0]).toStrictEqual(1);
            expect(result[1]).toStrictEqual(2);
        });

        it('should extract the value (path = value)', async () => {
            ezs.use({ value });
            const result = await runEzs(ezs, objectData, 'value', { path: 'value' });

            expect(result).toHaveLength(2);

            expect(result[0]).toStrictEqual({ a: 1 });
            expect(result[1]).toStrictEqual({ b: 2 });
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
            const result = await runEzs(ezs, deepObjectData, 'value', { path: 'id' });

            expect(result).toHaveLength(2);

            expect(result[0]).toStrictEqual(1);
            expect(result[1]).toStrictEqual(2);
        });

        it('should extract the value (path = value)', async () => {
            ezs.use({ value });
            const result = await runEzs(ezs, deepObjectData, 'value', { path: 'value' });

            expect(result).toHaveLength(2);


            expect(result[0]).toStrictEqual({
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
            expect(result[1]).toStrictEqual({
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
            const result = await runEzs(ezs, animalia100Data, 'value', { path: 'id' });

            expect(result).toHaveLength(5);

            expect(result[0]).toStrictEqual('0000000000000000000.02702702702702702506');
            expect(result[1]).toStrictEqual('0000000000000000000.03571428571428571924');
            expect(result[2]).toStrictEqual('0000000000000000000.07142857142857143848');
            expect(result[3]).toStrictEqual('0000000000000000000.08333333333333334259');
            expect(result[4]).toStrictEqual('0000000000000000000.08333333333333334259');
        });

        it('should extract the value (path = value)', async () => {
            ezs.use({ value });
            const result = await runEzs(ezs, animalia100Data, 'value', { path: 'value' });

            expect(result).toHaveLength(5);

            expect(result[0]).toStrictEqual({
                id: ['uid:/0579J7JN', 'uid:/KRVCJDGF'],
                value: 0.027027027027027025,
                values: [0, 0.05405405405405405],
            });
            expect(result[1]).toStrictEqual({
                id: ['uid:/0579J7JN', 'uid:/JW63WRFP'],
                value: 0.03571428571428572,
                values: [0, 0.07142857142857144],
            });
            expect(result[2]).toStrictEqual({
                id: ['uid:/0579J7JN', 'uid:/WC0F9P1S'],
                value: 0.07142857142857144,
                values: [0, 0.14285714285714288],
            });
            expect(result[3]).toStrictEqual({
                id: ['uid:/0579J7JN', 'uid:/J9N9N456'],
                value: 0.08333333333333334,
                values: [0.16666666666666669, 0],
            });
            expect(result[4]).toStrictEqual({
                id: ['uid:/0579J7JN', 'uid:/V572XQCD'],
                value: 0.08333333333333334,
                values: [0.16666666666666669, 0],
            });
        });
    });

    describe('genrated data', () => {
        const LENGTH = 1000;
        let genratedData =  [];

        beforeEach(() => {
            const data = [];
            for (let i = 0; i < LENGTH; i += 1) {
                data.push({
                    id: i,
                    value: i * 2,
                });
            }
            genratedData = data;
        });

        it('should extract the id (path = id)', async () => {
            ezs.use({ value });
            const result = await runEzs(ezs, genratedData, 'value', { path: 'id' });

            expect(result).toHaveLength(LENGTH);

            for (let i = 0; i < LENGTH; i += 1) {
                expect(result[i]).toStrictEqual(i);
            }
        });

        it('should extract the value (path = value)', async () => {
            ezs.use({ value });
            const result = await runEzs(ezs, genratedData, 'value', { path: 'value' });

            expect(result).toHaveLength(LENGTH);

            for (let i = 0; i < LENGTH; i += 1) {
                expect(result[i]).toStrictEqual(i * 2);
            }
        });
    });
});