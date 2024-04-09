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

        it('should expandAddress return the same oarray of object', async () => {
            const result = await runEzs(ezs, wrongData, 'expandAddress');

            expect(result).toStrictEqual(wrongData);
        });

        it('should expandAddress return the same a array of array of object', async () => {
            const result = await runEzs(ezs, wrongData2, 'expandAddress');

            expect(result).toStrictEqual(wrongData2);
        });

        it('should expandAddress with simple array of string', async () => {
            const result = await runEzs(ezs, simpleData, 'expandAddress');

            expect(result).toHaveLength(2);

            expect(result[0]).not.toBeNull();
            expect(result[0].value).not.toBeNull();
            expect(result[0].value).toHaveLength(2);
            expect(result[0].value[0])
                .toEqual('barboncino 781 franklin avenue crown heights brooklyn ny 11238');
            expect(result[0].value[1])
                .toEqual('barboncino 781 franklin avenue crown heights brooklyn new york 11238');

            expect(result[1]).not.toBeNull();
            expect(result[1].value).not.toBeNull();
            expect(result[1].value).toHaveLength(1);
            expect(result[1].value[0])
                .toEqual('inist-cnrs 2, rue jean zay cs 10310 f-54519 vandoeuvre-les-nancy france');
        });

        it('should expandAddress with simple array of array of string', async () => {
            const result = await runEzs(ezs, simpleData2, 'expandAddress');

            expect(result).toHaveLength(2);

            expect(result[0]).not.toBeNull();
            expect(result[0]).toHaveLength(2);

            expect(result[0][0]).not.toBeNull();
            expect(result[0][0].value).not.toBeNull();
            expect(result[0][0].value).toHaveLength(2);
            expect(result[0][0].value[0])
                .toEqual('barboncino 781 franklin avenue crown heights brooklyn ny 11238');
            expect(result[0][0].value[1])
                .toEqual('barboncino 781 franklin avenue crown heights brooklyn new york 11238');

            expect(result[0][1]).not.toBeNull();
            expect(result[0][1].value).not.toBeNull();
            expect(result[0][1].value).toHaveLength(1);
            expect(result[0][1].value[0])
                .toEqual('inist-cnrs 2, rue jean zay cs 10310 f-54519 vandoeuvre-les-nancy france');

            expect(result[1]).not.toBeNull();
            expect(result[1]).toHaveLength(1);

            expect(result[1][0]).not.toBeNull();
            expect(result[1][0].value).not.toBeNull();
            expect(result[1][0].value).toHaveLength(6);
            expect(result[1][0].value[0])
                .toEqual('university of bordeaux ims corners umr5218 talence f-33405 france');
            expect(result[1][0].value[1])
                .toEqual('university of bordeaux ims corners umr5218 talence f 33405 france');
            expect(result[1][0].value[2])
                .toEqual('university of bordeaux ims corners umr5218 talence front 33405 france');
            expect(result[1][0].value[3])
                .toEqual('university of bordeaux ims corners umr 5218 talence f-33405 france');
            expect(result[1][0].value[4])
                .toEqual('university of bordeaux ims corners umr 5218 talence f 33405 france');
            expect(result[1][0].value[5])
                .toEqual('university of bordeaux ims corners umr 5218 talence front 33405 france');
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