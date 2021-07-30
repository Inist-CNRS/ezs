import {
    existedInYear, followsNumeroLabel, hasEtabAssocs, hasLabelAndNumero, hasTutelle, isIn,
} from '../src/rnsr';

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

    it('should return false for structure lacking label', () => {
        const tokens = ['umr', 'one', 'two', '95'];
        /** @type {EtabAssoc[]} */
        const etabAssocs = [{
            labelAppauvri: '',
            idStructEtab: '?',
            label: 'UMR',
            numero: 95,
            etab: null,
        }];

        const result = followsNumeroLabel(tokens, etabAssocs);

        expect(result).toBe(false);
    });

    it('should return false for structure bad numero', () => {
        const tokens = ['umr', 'one', 'two', '96'];
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

    it('should return false when numero precedes label', () => {
        const tokens = ['95', 'umr'];
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

        // @ts-ignore
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

        // @ts-ignore
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

    it('should not find UMR 96', () => {
        const structure = {
            etabAssoc: [{
                labelAppauvri: 'umr',
                numero: 96,
            }],
        };
        const address = 'umr 95 universite de montpellier';

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
        const address = 'umr 95 34096 montpellier';

        // @ts-ignore
        const result = hasLabelAndNumero(address, structure);

        expect(result).toBe(true);
    });
});

describe('hasTutelle', () => {
    it('should find a Univ', () => {
        const structure = {
            etabAssoc: [{
                etab: {
                    libelleAppauvri: 'universite de lyon',
                },
            }],
        };
        const address = 'umr nnn universite de lyon blabla';
        // @ts-ignore
        const result = hasTutelle(address, structure);

        expect(result).toBe(true);
    });

    it('should not find the Univ', () => {
        const structure = {
            etabAssoc: [{
                etab: {
                    libelleAppauvri: 'universite de lyon',
                },
            }],
        };
        const address = 'umr nnn universite de nancy blabla';
        // @ts-ignore
        const result = hasTutelle(address, structure);

        expect(result).toBe(false);
    });

    it('should find a libelle', () => {
        const structure = {
            etabAssoc: [{
                etab: {
                    libelleAppauvri: 'labo X',
                    sigleAppauvri: 'sigle',
                },
            }],
        };
        const address = 'nnn labo X blabla';
        // @ts-ignore
        const result = hasTutelle(address, structure);

        expect(result).toBe(true);
    });

    it('should find a sigle', () => {
        const structure = {
            etabAssoc: [{
                etab: {
                    libelleAppauvri: 'labo x',
                    sigleAppauvri: 'sigle',
                },
            }],
        };
        const address = 'nnn sigle blabla';
        // @ts-ignore
        const result = hasTutelle(address, structure);

        expect(result).toBe(true);
    });

    it('should not find a sigle nor a libelle', () => {
        const structure = {
            etabAssoc: [{
                etab: {
                    libelleAppauvri: 'labo x',
                    sigleAppauvri: 'sigle',
                },
            }],
        };
        const address = 'nnn labo blabla';
        // @ts-ignore
        const result = hasTutelle(address, structure);

        expect(result).toBe(false);
    });
});

describe('hasEtabAssocs', () => {
    it('should return true when etabAssoc', () => {
        const structure = {
            etabAssoc: [{}],
        };
        // @ts-ignore
        const result = hasEtabAssocs(structure);

        expect(result).toBe(true);
    });

    it('should return false when etabAssoc is empty', () => {
        const structure = {
            etabAssoc: [],
        };
        // @ts-ignore
        const result = hasEtabAssocs(structure);

        expect(result).toBe(false);
    });

    it('should return false when no etabAssoc', () => {
        const structure = {};
        // @ts-ignore
        const result = hasEtabAssocs(structure);

        expect(result).toBe(false);
    });
});

describe('existedInYear', () => {
    it('should exist', () => {
        const structure = {
            annee_creation: '2000',
            an_fermeture: '',
        };
        const year = 2021;

        const result = existedInYear(year)(structure);

        expect(result).toBe(true);
    });

    it('should exist when no year given', () => {
        const structure = {
            annee_creation: '2000',
            an_fermeture: '',
        };

        const result = existedInYear()(structure);

        expect(result).toBe(true);
    });

    it('should exist within an interval', () => {
        const structure = {
            annee_creation: '2000',
            an_fermeture: '2020',
        };
        const year = 2010;

        const result = existedInYear(year)(structure);

        expect(result).toBe(true);
    });

    it('should not exist', () => {
        const structure = {
            annee_creation: '2000',
            an_fermeture: '',
        };
        const year = 1999;

        const result = existedInYear(year)(structure);

        expect(result).toBe(false);
    });

    it('should not exist when year is greater than closing', () => {
        const structure = {
            annee_creation: '2000',
            an_fermeture: '2010',
        };
        const year = 2015;

        const result = existedInYear(year)(structure);

        expect(result).toBe(false);
    });
});
