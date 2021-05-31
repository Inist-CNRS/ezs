import { followsNumeroLabel } from '../src/rnsr';

/**
 * @typedef {import("../src/rnsr").EtabAssoc} EtabAssoc
 */
describe('followsNumeroLabel', () => {
    it('should return true when label and numero are in the same token', () => {
        const tokens = ['umr95'];
        /** @type {EtabAssoc[]} */
        const etabAssocs = [{
            labelAppauvri: 'umr',
            idStructEtab: '?',
            label: 'UMR',
            numero: 95,
            etab: null,
        }];

        const result = followsNumeroLabel(tokens, etabAssocs);

        expect(result).toBe(true);
    });
});
