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

    it('should return true when label and numero are in two tokens in sequence', () => {
        const tokens = ['umr', '95'];
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

    it('should return true when label and numero are in two tokens in sequence, separated with one token', () => {
        const tokens = ['umr', 'anything', '95'];
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

    it('should return false when label and numero are in two tokens in sequence, separated with two tokens', () => {
        const tokens = ['umr', 'one', 'two', '95'];
        /** @type {EtabAssoc[]} */
        const etabAssocs = [{
            labelAppauvri: 'umr',
            idStructEtab: '?',
            label: 'UMR',
            numero: 95,
            etab: null,
        }];

        const result = followsNumeroLabel(tokens, etabAssocs);

        expect(result).toBe(false);
    });
});
