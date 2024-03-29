import ezs from '../../core/src';
import summing from '../src/summing';
import runEzs from '../test-utils/runEzs';

ezs.addPath(__dirname);

describe('summing', () => {

    beforeAll(() => {
        ezs.use({ summing });
    });

    describe('wrong data', () => {
        const undefinedData = [
            undefined,
            undefined,
            undefined,
            undefined
        ];

        const nullData = [
            null,
            null,
            null,
            null
        ];

        const undefinedNullData = [
            undefined,
            null,
            undefined,
            null
        ];

        const wrongKeyData = [
            {
                'hello': 'world',
            },
            {
                'hello': 'world',
            }
        ];

        it('should return no result when input contains only undefined', async () => {
            const result = await runEzs(ezs, undefinedData, 'summing');

            expect(result).toHaveLength(0);
        });

        it.skip('should return no result when input contains only null', async () => {
            const result = await runEzs(ezs, nullData, 'summing');

            expect(result).toHaveLength(0);
        });

        it.skip('should return no result when input contains undefined and null', async () => {
            const result = await runEzs(ezs, undefinedNullData, 'summing');

            expect(result).toHaveLength(0);
        });

        it('should return no result when input contains wrong key', async () => {
            const result = await runEzs(ezs, wrongKeyData, 'summing');

            expect(result).toHaveLength(0);
        });
    });

    describe('summing, simple object', () => {
        const simpleData =  [
            {
                'id': 1,
                'value': [1, 1, 1]
            },
            {
                'id': 2,
                'value': [2, 2, 2]
            }
        ];

        it('should sum value (id = id, value = value)', async () => {
            const result = await runEzs(ezs, simpleData, 'summing');

            expect(result).not.toBeNull();

            expect(result).toHaveLength(2);

            expect(result[0]).not.toBeNull();
            expect(result[0].id).toStrictEqual(1);
            expect(result[0].value).toStrictEqual(3);

            expect(result[1]).not.toBeNull();
            expect(result[1].id).toStrictEqual(2);
            expect(result[1].value).toStrictEqual(6);
        });

        it('should not sum id (id = value, value = id)', async () => {
            const result = await runEzs(ezs, simpleData, 'summing', {
                id   : 'value',
                value: 'id',
            });

            expect(result).not.toBeNull();

            expect(result).toHaveLength(2);

            expect(result[0]).not.toBeNull();
            expect(result[0].id).toStrictEqual([1, 1, 1]);
            expect(result[0].value).toStrictEqual(1);

            expect(result[1]).not.toBeNull();
            expect(result[1].id).toStrictEqual([2, 2, 2]);
            expect(result[1].value).toStrictEqual(2);
        });
    });

    describe('summing, noisy object', () => {
        const noisyData =  [
            {
                'id': 2,
                'value': [10, 10, 10],
                'hello': 'world'
            },
            {
                'id': 4,
                'value': [20, 20, 20],
                'hello': 'world'
            }
        ];

        it('should sum value and remove noise (id = id, value = value)', async () => {
            const result = await runEzs(ezs, noisyData, 'summing');

            expect(result).not.toBeNull();

            expect(result).toHaveLength(2);

            expect(result[0]).not.toBeNull();
            expect(result[0].id).toStrictEqual(2);
            expect(result[0].value).toStrictEqual(30);
            expect(result[0]).not.toHaveProperty('hello');

            expect(result[1]).not.toBeNull();
            expect(result[1].id).toStrictEqual(4);
            expect(result[1].value).toStrictEqual(60);
            expect(result[1]).not.toHaveProperty('hello');
        });

        it('should not sum id and remove noise (id = value, value = id)', async () => {
            const result = await runEzs(ezs, noisyData, 'summing', {
                id   : 'value',
                value: 'id',
            });

            expect(result).not.toBeNull();

            expect(result).toHaveLength(2);

            expect(result[0]).not.toBeNull();
            expect(result[0].id).toStrictEqual([10, 10, 10]);
            expect(result[0].value).toStrictEqual(2);
            expect(result[0]).not.toHaveProperty('hello');

            expect(result[1]).not.toBeNull();
            expect(result[1].id).toStrictEqual([20, 20, 20]);
            expect(result[1].value).toStrictEqual(4);
            expect(result[1]).not.toHaveProperty('hello');
        });
    });
});