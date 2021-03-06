import { followsNumeroLabel, hasLabelAndNumero, isIn } from '../src/rnsr';

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

describe('isIn', () => {
    it('should find a structure within its complete address', () => {
        const structure = {
            etabAssoc: [{
                natTutEtab: 'TUTE',
                etab: {
                    cleEtab: '437',
                    sigleAppauvri: 'montpellier',
                    libelleAppauvri: 'universite de montpellier',
                    numUAI: '0342321N',
                    SirenSiret: '13002054800017',
                },
                idStructEtab: 'UMR_B95',
                labelAppauvri: 'umr_b',
                numero: 95,
            }],
            ville_postal_appauvrie: 'montpellier cedex 05',
            code_postal: '34095',
        };
        const address = 'universite de montpellier umr_b 95 34095 montpellier';
        const isInAddress = isIn(address);

        const result = isInAddress(structure);

        expect(result).toBe(true);
    });

    it('should not find Université de Montpellier', () => {
        const structure = {
            etabAssoc: [{
                natTutEtab: 'TUTE',
                etab: {
                    cleEtab: '437',
                    sigleAppauvri: 'montpellier',
                    libelleAppauvri: 'universite de montpellier',
                    numUAI: '0342321N',
                    SirenSiret: '13002054800017',
                },
                idStructEtab: 'UMR_B95',
                labelAppauvri: 'umr_b',
                numero: 95,
            }],
            ville_postal_appauvrie: 'montpellier cedex 05',
            code_postal: '34095',
        };
        const address = 'universite de montpellier 34095 montpellier';
        const isInAddress = isIn(address);

        const result = isInAddress(structure);

        expect(result).toBe(false);
    });
});

describe('hasLabelAndNumero', () => {
    it('should not find UMR 95', () => {
        const structure = {
            etabAssoc: [{
                labelAppauvri: 'umr',
                numero: 95,
            }],
        };
        const address = 'umr5324 universite de montpellier 34095 montpellier';

        // @ts-ignore
        const result = hasLabelAndNumero(address, structure);

        expect(result).toBe(false);
    });

    it('should find UMR 95', () => {
        const structure = {
            etabAssoc: [{
                labelAppauvri: 'umr',
                numero: 95,
            }],
        };
        const address = 'umr 95 universite de montpellier 34096 montpellier';

        // @ts-ignore
        const result = hasLabelAndNumero(address, structure);

        expect(result).toBe(true);
    });
});
