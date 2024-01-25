import ezs from '../../core/src';
import tune from '../src/tune';
import runEzs from '../test-utils/runEzs';

ezs.addPath(__dirname);

describe('tune', () => {

    beforeAll(() => {
        ezs.use({ tune });
    });

    describe('normalize, simple object', () => {
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

        it('should normalize (path = id)', async () => {
            const result = await runEzs(ezs, simpleData, 'tune');

            expect(result[0]).not.toBeNull();
            expect(result[1]).not.toBeNull();

            expect(result[0].id).toStrictEqual('0000000000000000001.00000000000000000000');
            expect(result[1].id).toStrictEqual('0000000000000000002.00000000000000000000');

            expect(result[0].value).toStrictEqual(simpleData[0]);
            expect(result[1].value).toStrictEqual(simpleData[1]);
        });

        it('should normalize (path = value)', async () => {
            const result = await runEzs(ezs, simpleData, 'tune', { path: 'value' });

            expect(result[0]).not.toBeNull();
            expect(result[1]).not.toBeNull();

            expect(result[0].id).toStrictEqual('0000000000000000003.00000000000000000000');
            expect(result[1].id).toStrictEqual('0000000000000000004.00000000000000000000');

            expect(result[0].value).toStrictEqual(simpleData[0]);
            expect(result[1].value).toStrictEqual(simpleData[1]);
        });
    });

    describe('normalize, array object', () => {
        const arrayData =  [
            {
                'id': 1,
                'value': [3, 4]
            },
            {
                'id': 2,
                'value': [5, 6]
            }
        ];

        it('should normalize (path = id)', async () => {
            const result = await runEzs(ezs, arrayData, 'tune');

            expect(result[0]).not.toBeNull();
            expect(result[1]).not.toBeNull();

            expect(result[0].id).toStrictEqual('0000000000000000001.00000000000000000000');
            expect(result[1].id).toStrictEqual('0000000000000000002.00000000000000000000');

            expect(result[0].value).toStrictEqual(arrayData[0]);
            expect(result[1].value).toStrictEqual(arrayData[1]);
        });

        it('should normalize (path = value)', async () => {
            const result = await runEzs(ezs, arrayData, 'tune', { path: 'value' });

            expect(result[0]).not.toBeNull();
            expect(result[1]).not.toBeNull();

            expect(result[0].id).toStrictEqual('3,4');
            expect(result[1].id).toStrictEqual('5,6');

            expect(result[0].value).toStrictEqual(arrayData[0]);
            expect(result[1].value).toStrictEqual(arrayData[1]);
        });
    });
});