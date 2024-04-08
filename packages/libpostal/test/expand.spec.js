import ezs from '../../core/src';
import expandAddress from '../src/expand-address';
import expandAddressWith from '../src/expand-address-with';
import runEzs from '../test-utils/runEzs';

ezs.addPath(__dirname);

describe('expandAddress', () => {

    beforeAll(() => {
        ezs.use({ expandAddress, expandAddressWith });
    });

    describe('expandAddress, simple object', () => {
        const simpleData =  [
            'Barboncino 781 Franklin Ave, Crown Heights, Brooklyn, NY 11238'
        ];

        it('should expandAddress', async () => {
            const result = await runEzs(ezs, simpleData, 'expandAddress');

            expect(result[0]).not.toBeNull();

            console.log(result);
        });
    });

    describe('expandAddressWith, simple object', () => {
        const simpleData =  [
            {value: 'Barboncino 781 Franklin Ave, Crown Heights, Brooklyn, NY 11238'}
        ];

        it('should expandAddressWith (path = value)', async () => {
            const result = await runEzs(ezs, simpleData, 'expandAddressWith', {path: 'value'});

            expect(result[0]).not.toBeNull();

            console.log(result);
        });
    });
});