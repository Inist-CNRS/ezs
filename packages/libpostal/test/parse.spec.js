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
        const wrongData = [
            {'hello': 'world'},
            {'mario': 'luigi'}
        ];

        const wrongData2 = [
            [
                {'hello': 'world'},
                {'mario': 'luigi'}
            ],
            [
                {'wario': 'waluigi'}
            ]
        ];

        const simpleData =  [
            'Barboncino 781 Franklin Ave, Crown Heights, Brooklyn, NY 11238',
            'Inist-CNRS 2, rue Jean Zay CS 10310 F‑54519 Vandœuvre-lès-Nancy France'
        ];

        const simpleData2 =  [
            [
                'Barboncino 781 Franklin Ave, Crown Heights, Brooklyn, NY 11238',
                'Inist-CNRS 2, rue Jean Zay CS 10310 F‑54519 Vandœuvre-lès-Nancy France'
            ],
            [
                'University of Bordeaux, IMS, CNRS UMR5218, Talence, F-33405, France'
            ]
        ];

        it('should return the same object', async () => {
            const result = await runEzs(ezs, wrongData, 'parseAddress');

            expect(result).toStrictEqual(wrongData);
        });

        it('should return the same array of object', async () => {
            const result = await runEzs(ezs, wrongData2, 'parseAddress');

            expect(result).toStrictEqual(wrongData2);
        });

        it('should parse the address on simple string', async () => {
            const result = await runEzs(ezs, simpleData, 'parseAddress');

            expect(result).toHaveLength(2);

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

            expect(result[1]).not.toBeNull();
            expect(result[1].id).not.toBeNull();
            expect(result[1].id).toEqual(simpleData[1]);
            expect(result[1].value).not.toBeNull();
            expect(result[1].value.house).toEqual('inist-cnrs');
            expect(result[1].value.house_number).toEqual('2');
            expect(result[1].value.road).toEqual('rue jean zay cs 10310');
            expect(result[1].value.postcode).toEqual('f-54519');
            expect(result[1].value.city).toEqual('vandœuvre-lès-nancy');
            expect(result[1].value.country).toEqual('france');
        });

        it('should parse the address on an array of string', async () => {
            const result = await runEzs(ezs, simpleData2, 'parseAddress');

            expect(result).toHaveLength(2);

            expect(result[0]).not.toBeNull();
            expect(result[0]).toHaveLength(2);

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

            expect(result[0][1]).not.toBeNull();
            expect(result[0][1].id).not.toBeNull();
            expect(result[0][1].id).toEqual(simpleData2[0][1]);
            expect(result[0][1].value).not.toBeNull();
            expect(result[0][1].value.house).toEqual('inist-cnrs');
            expect(result[0][1].value.house_number).toEqual('2');
            expect(result[0][1].value.road).toEqual('rue jean zay cs 10310');
            expect(result[0][1].value.postcode).toEqual('f-54519');
            expect(result[0][1].value.city).toEqual('vandœuvre-lès-nancy');
            expect(result[0][1].value.country).toEqual('france');

            expect(result[1]).not.toBeNull();
            expect(result[1]).toHaveLength(1);

            expect(result[1][0]).not.toBeNull();
            expect(result[1][0].id).not.toBeNull();
            expect(result[1][0].id).toEqual(simpleData2[1][0]);
            expect(result[1][0].value).not.toBeNull();
            expect(result[1][0].value.house).toEqual('university of bordeaux ims cnrs umr5218');
            expect(result[1][0].value.postcode).toEqual('f-33405');
            expect(result[1][0].value.city).toEqual('talence');
            expect(result[1][0].value.country).toEqual('france');
        });
    });

    describe('parseAddressWith', () => {
        const wrongData = [
            {'hello': 'world'},
            {'mario': 'luigi'}
        ];

        const wrongData2 = [
            [
                {'hello': 'world'},
                {'mario': 'luigi'}
            ],
            [
                {'wario': 'waluigi'}
            ]
        ];

        const simpleData =  [
            {value: 'Barboncino 781 Franklin Ave, Crown Heights, Brooklyn, NY 11238'},
            {value: 'Inist-CNRS 2, rue Jean Zay CS 10310 F‑54519 Vandœuvre-lès-Nancy France'}
        ];

        const simpleData2 =  [
            {other_path: 'Barboncino 781 Franklin Ave, Crown Heights, Brooklyn, NY 11238'},
            {other_path: 'Inist-CNRS 2, rue Jean Zay CS 10310 F‑54519 Vandœuvre-lès-Nancy France'}
        ];

        const simpleData3 =  [
            [
                {value: 'Barboncino 781 Franklin Ave, Crown Heights, Brooklyn, NY 11238'},
                {value: 'Inist-CNRS 2, rue Jean Zay CS 10310 F‑54519 Vandœuvre-lès-Nancy France'}
            ],
            [
                {value: 'University of Bordeaux, IMS, CNRS UMR5218, Talence, F-33405, France'}
            ]
        ];

        const simpleData4 =  [
            [
                {other_path: 'Barboncino 781 Franklin Ave, Crown Heights, Brooklyn, NY 11238'},
                {other_path: 'Inist-CNRS 2, rue Jean Zay CS 10310 F‑54519 Vandœuvre-lès-Nancy France'}
            ],
            [
                {other_path: 'University of Bordeaux, IMS, CNRS UMR5218, Talence, F-33405, France'}
            ]
        ];

        it('should return the same object', async () => {
            const result = await runEzs(ezs, wrongData, 'parseAddressWith');

            expect(result).toStrictEqual(wrongData);
        });

        it('should return the same array of object', async () => {
            const result = await runEzs(ezs, wrongData2, 'parseAddressWith');

            expect(result).toStrictEqual(wrongData2);
        });

        it('should parse the address on simple object (path = value, object)', async () => {
            const result = await runEzs(ezs, simpleData, 'parseAddressWith');

            expect(result).toHaveLength(2);

            expect(result[0]).not.toBeNull();
            expect(result[0].value).not.toBeNull();
            expect(result[0].value.id).not.toBeNull();
            expect(result[0].value.id).toEqual(simpleData[0].value);
            expect(result[0].value.value).not.toBeNull();
            expect(result[0].value.value.house).toEqual('barboncino');
            expect(result[0].value.value.house_number).toEqual('781');
            expect(result[0].value.value.road).toEqual('franklin ave');
            expect(result[0].value.value.suburb).toEqual('crown heights');
            expect(result[0].value.value.city_district).toEqual('brooklyn');
            expect(result[0].value.value.state).toEqual('ny');
            expect(result[0].value.value.postcode).toEqual('11238');

            expect(result[1]).not.toBeNull();
            expect(result[1].value).not.toBeNull();
            expect(result[1].value.id).not.toBeNull();
            expect(result[1].value.id).toEqual(simpleData[1].value);
            expect(result[1].value.value).not.toBeNull();
            expect(result[1].value.value.house).toEqual('inist-cnrs');
            expect(result[1].value.value.house_number).toEqual('2');
            expect(result[1].value.value.road).toEqual('rue jean zay cs 10310');
            expect(result[1].value.value.postcode).toEqual('f-54519');
            expect(result[1].value.value.city).toEqual('vandœuvre-lès-nancy');
            expect(result[1].value.value.country).toEqual('france');
        });

        it('should parse the address on simple object (path = other_path, object)', async () => {
            const result = await runEzs(ezs, simpleData2, 'parseAddressWith', {path: 'other_path'});

            expect(result).toHaveLength(2);

            expect(result[0]).not.toBeNull();
            expect(result[0].other_path).not.toBeNull();
            expect(result[0].other_path.id).not.toBeNull();
            expect(result[0].other_path.id).toEqual(simpleData[0].value);
            expect(result[0].other_path.value).not.toBeNull();
            expect(result[0].other_path.value.house).toEqual('barboncino');
            expect(result[0].other_path.value.house_number).toEqual('781');
            expect(result[0].other_path.value.road).toEqual('franklin ave');
            expect(result[0].other_path.value.suburb).toEqual('crown heights');
            expect(result[0].other_path.value.city_district).toEqual('brooklyn');
            expect(result[0].other_path.value.state).toEqual('ny');
            expect(result[0].other_path.value.postcode).toEqual('11238');

            expect(result[1]).not.toBeNull();
            expect(result[1].other_path).not.toBeNull();
            expect(result[1].other_path.id).not.toBeNull();
            expect(result[1].other_path.id).toEqual(simpleData[1].value);
            expect(result[1].other_path.value).not.toBeNull();
            expect(result[1].other_path.value.house).toEqual('inist-cnrs');
            expect(result[1].other_path.value.house_number).toEqual('2');
            expect(result[1].other_path.value.road).toEqual('rue jean zay cs 10310');
            expect(result[1].other_path.value.postcode).toEqual('f-54519');
            expect(result[1].other_path.value.city).toEqual('vandœuvre-lès-nancy');
            expect(result[1].other_path.value.country).toEqual('france');
        });

        it('should parse the address on an array of object (path = value, array of object)', async () => {
            const result = await runEzs(ezs, simpleData3, 'parseAddressWith');

            expect(result).toHaveLength(2);

            expect(result[0]).toHaveLength(2);

            expect(result[0][0]).not.toBeNull();
            expect(result[0][0].value).not.toBeNull();
            expect(result[0][0].value.id).not.toBeNull();
            expect(result[0][0].value.id).toEqual(simpleData3[0][0].value);
            expect(result[0][0].value.value).not.toBeNull();
            expect(result[0][0].value.value.house).toEqual('barboncino');
            expect(result[0][0].value.value.house_number).toEqual('781');
            expect(result[0][0].value.value.road).toEqual('franklin ave');
            expect(result[0][0].value.value.suburb).toEqual('crown heights');
            expect(result[0][0].value.value.city_district).toEqual('brooklyn');
            expect(result[0][0].value.value.state).toEqual('ny');
            expect(result[0][0].value.value.postcode).toEqual('11238');

            expect(result[0][1]).not.toBeNull();
            expect(result[0][1].value).not.toBeNull();
            expect(result[0][1].value.id).not.toBeNull();
            expect(result[0][1].value.id).toEqual(simpleData3[0][1].value);
            expect(result[0][1].value.value).not.toBeNull();
            expect(result[0][1].value.value.house).toEqual('inist-cnrs');
            expect(result[0][1].value.value.house_number).toEqual('2');
            expect(result[0][1].value.value.road).toEqual('rue jean zay cs 10310');
            expect(result[0][1].value.value.postcode).toEqual('f-54519');
            expect(result[0][1].value.value.city).toEqual('vandœuvre-lès-nancy');
            expect(result[0][1].value.value.country).toEqual('france');

            expect(result[1]).toHaveLength(1);

            expect(result[1][0]).not.toBeNull();
            expect(result[1][0].value).not.toBeNull();
            expect(result[1][0].value.id).not.toBeNull();
            expect(result[1][0].value.id).toEqual(simpleData3[1][0].value);
            expect(result[1][0].value.value).not.toBeNull();
            expect(result[1][0].value.value.house).toEqual('university of bordeaux ims cnrs umr5218');
            expect(result[1][0].value.value.postcode).toEqual('f-33405');
            expect(result[1][0].value.value.city).toEqual('talence');
            expect(result[1][0].value.value.country).toEqual('france');
        });

        it('should parse the address on an array of object (path = other_path, array of object)', async () => {
            const result = await runEzs(ezs, simpleData4, 'parseAddressWith', {path: 'other_path'});

            expect(result).toHaveLength(2);

            expect(result[0]).toHaveLength(2);

            expect(result[0][0]).not.toBeNull();
            expect(result[0][0].other_path).not.toBeNull();
            expect(result[0][0].other_path.id).not.toBeNull();
            expect(result[0][0].other_path.id).toEqual(simpleData4[0][0].other_path);
            expect(result[0][0].other_path.value).not.toBeNull();
            expect(result[0][0].other_path.value.house).toEqual('barboncino');
            expect(result[0][0].other_path.value.house_number).toEqual('781');
            expect(result[0][0].other_path.value.road).toEqual('franklin ave');
            expect(result[0][0].other_path.value.suburb).toEqual('crown heights');
            expect(result[0][0].other_path.value.city_district).toEqual('brooklyn');
            expect(result[0][0].other_path.value.state).toEqual('ny');
            expect(result[0][0].other_path.value.postcode).toEqual('11238');

            expect(result[0][1]).not.toBeNull();
            expect(result[0][1].other_path).not.toBeNull();
            expect(result[0][1].other_path.id).not.toBeNull();
            expect(result[0][1].other_path.id).toEqual(simpleData4[0][1].other_path);
            expect(result[0][1].other_path.value).not.toBeNull();
            expect(result[0][1].other_path.value.house).toEqual('inist-cnrs');
            expect(result[0][1].other_path.value.house_number).toEqual('2');
            expect(result[0][1].other_path.value.road).toEqual('rue jean zay cs 10310');
            expect(result[0][1].other_path.value.postcode).toEqual('f-54519');
            expect(result[0][1].other_path.value.city).toEqual('vandœuvre-lès-nancy');
            expect(result[0][1].other_path.value.country).toEqual('france');

            expect(result[1]).toHaveLength(1);

            expect(result[1][0]).not.toBeNull();
            expect(result[1][0].other_path).not.toBeNull();
            expect(result[1][0].other_path.id).not.toBeNull();
            expect(result[1][0].other_path.id).toEqual(simpleData4[1][0].other_path);
            expect(result[1][0].other_path.value).not.toBeNull();
            expect(result[1][0].other_path.value.house).toEqual('university of bordeaux ims cnrs umr5218');
            expect(result[1][0].other_path.value.postcode).toEqual('f-33405');
            expect(result[1][0].other_path.value.city).toEqual('talence');
            expect(result[1][0].other_path.value.country).toEqual('france');
        });
    });
});