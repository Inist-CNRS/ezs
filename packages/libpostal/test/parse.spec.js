import ezs from '../../core/src';
import parseAddress from '../src/parse-address';
import parseAddressWith from '../src/parse-address-with';
import runEzs from '../test-utils/runEzs';

ezs.addPath(__dirname);

describe('parseAddress, parseAddressWith', () => {

    beforeAll(() => {
        ezs.use({ parseAddress, parseAddressWith });
    });

    describe('parseAddress', () => {
        const simpleData =  [
            'Barboncino 781 Franklin Ave, Crown Heights, Brooklyn, NY 11238'
        ];

        const simpleData2 =  [
            ['Barboncino 781 Franklin Ave, Crown Heights, Brooklyn, NY 11238']
        ];

        it('should parseAddress with simple array of string', async () => {
            const result = await runEzs(ezs, simpleData, 'parseAddress');

            expect(result).toHaveLength(1);
            expect(result[0]).not.toBeNull();
            expect(result[0].id).not.toBeNull();
            expect(result[0].id).toEqual(simpleData[0]);
            expect(result[0].value).not.toBeNull();
            expect(result[0].value.house).toEqual('barboncino');
            expect(result[0].value.house_number).toEqual('781');
            expect(result[0].value.road).toEqual('franklin ave');
            expect(result[0].value.suburb).toEqual('crown heights');
            expect(result[0].value.city_district).toEqual('brooklyn');
            expect(result[0].value.state).toEqual('ny');
            expect(result[0].value.postcode).toEqual('11238');
        });

        it('should parseAddress with simple array of array of string', async () => {
            const result = await runEzs(ezs, simpleData2, 'parseAddress');

            expect(result).toHaveLength(1);
            expect(result[0]).not.toBeNull();
            expect(result[0][0]).not.toBeNull();
            expect(result[0][0].id).not.toBeNull();
            expect(result[0][0].id).toEqual(simpleData2[0][0]);
            expect(result[0][0].value).not.toBeNull();
            expect(result[0][0].value.house).toEqual('barboncino');
            expect(result[0][0].value.house_number).toEqual('781');
            expect(result[0][0].value.road).toEqual('franklin ave');
            expect(result[0][0].value.suburb).toEqual('crown heights');
            expect(result[0][0].value.city_district).toEqual('brooklyn');
            expect(result[0][0].value.state).toEqual('ny');
            expect(result[0][0].value.postcode).toEqual('11238');
        });
    });

    describe('parseAddressWith', () => {
        const simpleData =  [
            {value: 'Barboncino 781 Franklin Ave, Crown Heights, Brooklyn, NY 11238'}
        ];

        const simpleData2 =  [
            {other_path: 'Barboncino 781 Franklin Ave, Crown Heights, Brooklyn, NY 11238'}
        ];

        it('should parseAddressWith (path = value)', async () => {
            const result = await runEzs(ezs, simpleData, 'parseAddressWith', {path: 'value'});

            console.dir(result);

            expect(result).toHaveLength(1);
            expect(result[0]).not.toBeNull();
            expect(result[0].id).not.toBeNull();
            expect(result[0].id).toEqual(simpleData[0].value);
            expect(result[0].value).not.toBeNull();
            expect(result[0].value.house).toEqual('barboncino');
            expect(result[0].value.house_number).toEqual('781');
            expect(result[0].value.road).toEqual('franklin ave');
            expect(result[0].value.suburb).toEqual('crown heights');
            expect(result[0].value.city_district).toEqual('brooklyn');
            expect(result[0].value.state).toEqual('ny');
            expect(result[0].value.postcode).toEqual('11238');
        });

        it('should parseAddressWith (path = other_path)', async () => {
            const result = await runEzs(ezs, simpleData2, 'parseAddressWith', {path: 'other_path'});

            expect(result).toHaveLength(1);
            expect(result[0]).not.toBeNull();
            expect(result[0].id).not.toBeNull();
            expect(result[0].id).toEqual(simpleData2[0].other_path);
            expect(result[0].other_path).not.toBeNull();
            expect(result[0].other_path.house).toEqual('barboncino');
            expect(result[0].other_path.house_number).toEqual('781');
            expect(result[0].other_path.road).toEqual('franklin ave');
            expect(result[0].other_path.suburb).toEqual('crown heights');
            expect(result[0].other_path.city_district).toEqual('brooklyn');
            expect(result[0].other_path.state).toEqual('ny');
            expect(result[0].other_path.postcode).toEqual('11238');
        });
    });
});