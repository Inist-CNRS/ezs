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

        it.skip('should expandAddress with simple array of string', async () => {
            const result = await runEzs(ezs, simpleData, 'expandAddress');

            expect(result[0]).not.toBeNull();
        });

        it('should expandAddress with simple array of array of string', async () => {
            const result = await runEzs(ezs, simpleData2, 'expandAddress');

            expect(result[0]).not.toBeNull();

            console.log(result);
        });
    });

    describe('expandAddressWith', () => {
        const simpleData =  [
            {value: 'Barboncino 781 Franklin Ave, Crown Heights, Brooklyn, NY 11238'}
        ];

        it('should expandAddressWith (path = value)', async () => {
            const result = await runEzs(ezs, simpleData, 'expandAddressWith', {path: 'value'});

            expect(result[0]).not.toBeNull();

            expect(result[0].id).toEqual(simpleData[0].value);

            console.log(result[0].value);
        });
    });
});