import ezs from '../../core/src';
import expandAddress from '../src/expand-address';
import expandAddressWith from '../src/expand-address-with';
import runEzs from '../test-utils/runEzs';

ezs.addPath(__dirname);

describe('expandAddress, expandAddressWith', () => {

    beforeAll(() => {
        ezs.use({ expandAddress, expandAddressWith });
    });

    describe('expandAddress', () => {
        const simpleData =  [
            'Barboncino 781 Franklin Ave, Crown Heights, Brooklyn, NY 11238'
        ];

        const simpleData2 =  [
            ['Barboncino 781 Franklin Ave, Crown Heights, Brooklyn, NY 11238']
        ];

        it('should expandAddress with simple array of string', async () => {
            const result = await runEzs(ezs, simpleData, 'expandAddress');

            expect(result).toHaveLength(1);
            expect(result[0]).not.toBeNull();
            expect(result[0].value).not.toBeNull();
            expect(result[0].value).toHaveLength(2);
            expect(result[0].value[0])
                .toEqual('barboncino 781 franklin avenue crown heights brooklyn ny 11238');
            expect(result[0].value[1])
                .toEqual('barboncino 781 franklin avenue crown heights brooklyn new york 11238');
        });

        it('should expandAddress with simple array of array of string', async () => {
            const result = await runEzs(ezs, simpleData2, 'expandAddress');

            expect(result).toHaveLength(1);
            expect(result[0]).not.toBeNull();
            expect(result[0][0]).not.toBeNull();
            expect(result[0][0].value).not.toBeNull();
            expect(result[0][0].value).toHaveLength(2);
            expect(result[0][0].value[0])
                .toEqual('barboncino 781 franklin avenue crown heights brooklyn ny 11238');
            expect(result[0][0].value[1])
                .toEqual('barboncino 781 franklin avenue crown heights brooklyn new york 11238');
        });
    });

    describe('expandAddressWith', () => {
        const simpleData =  [
            {value: 'Barboncino 781 Franklin Ave, Crown Heights, Brooklyn, NY 11238'}
        ];

        const simpleData2 =  [
            {other_path: 'Barboncino 781 Franklin Ave, Crown Heights, Brooklyn, NY 11238'}
        ];

        it('should expandAddressWith (path = value)', async () => {
            const result = await runEzs(ezs, simpleData, 'expandAddressWith', {path: 'value'});

            expect(result).toHaveLength(1);
            expect(result[0]).not.toBeNull();
            expect(result[0].value).not.toBeNull();
            expect(result[0].value).toHaveLength(2);
            expect(result[0].value[0])
                .toEqual('barboncino 781 franklin avenue crown heights brooklyn ny 11238');
            expect(result[0].value[1])
                .toEqual('barboncino 781 franklin avenue crown heights brooklyn new york 11238');
        });

        it('should expandAddressWith (path = other_path)', async () => {
            const result = await runEzs(ezs, simpleData2, 'expandAddressWith', {path: 'other_path'});

            expect(result).toHaveLength(1);
            expect(result[0]).not.toBeNull();
            expect(result[0].other_path).not.toBeNull();
            expect(result[0].other_path).toHaveLength(2);
            expect(result[0].other_path[0])
                .toEqual('barboncino 781 franklin avenue crown heights brooklyn ny 11238');
            expect(result[0].other_path[1])
                .toEqual('barboncino 781 franklin avenue crown heights brooklyn new york 11238');
        });
    });
});