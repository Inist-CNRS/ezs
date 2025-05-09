import fs from 'fs';
import path from 'path';

/**
 * @typedef {{structures: Structures}} RepNatStrRech
 * @private
 */

/**
 * @typedef {{
 * origineDonnees: object,
 * structure: Structure[]
 * }} Structures
 * @private
 */

/**
 * @typedef {{
 * num_nat_struct: string,
 * intitule: string,
 * intituleAppauvri: string,
 * sigle: string,
 * sigleAppauvri: string,
 * annee_creation?: number,
 * an_der_rec?: number,
 * an_fermeture?: number,
 * code_postal: number,
 * ville_postale: string,
 * ville_postale_appauvrie: string,
 * etabAssoc: EtabAssoc[]
 * }} Structure
 * @private
 */

/**
 * @typedef {{
 * natTutEtab?: "TUTE"|"PART",
 * etab: Etab,
 * anDebut?: number,
 * anFin?: number,
 * idStructEtab: string,
 * label: string,
 * labelAppauvri: string,
 * numero: number
 * }} EtabAssoc
 * @private
 */

/**
 * @typedef {{
 * cleEtab?: string,
 * sigle: string,
 * sigleAppauvri: string,
 * libelle: string,
 * libelleAppauvri: string,
 * numUAI: string,
 * SirenSiret: string
 * }} Etab
 * @private
 */

const hasLabel = (address, etabAssocs) => etabAssocs[0] && etabAssocs.some(
    (etabAssoc) => address.includes(etabAssoc.labelAppauvri || '**'),
);
const hasNumero = (address, etabAssocs) => etabAssocs[0] && etabAssocs.some(
    (etabAssoc) => address.includes(String(etabAssoc.numero) || '**'),
);
/**
 * Say if numero follows label (optionnally with one token between both, or
 * without separator).
 * @param {string[]} tokens depleted tokens (lowercase, without accents)
 * @param {EtabAssoc[]} etabAssocs
 * @returns {boolean}
 * @private
 */
export const followsNumeroLabel = (tokens, etabAssocs) => etabAssocs[0]
    && etabAssocs.some(
        (etabAssoc) => {
            const { labelAppauvri: label, numero } = etabAssoc;
            if (label === '' || String(numero) === '') return false;
            if (tokens.includes(`${label}${numero}`)) return true;
            const labelIndex = tokens.indexOf(label.toLowerCase());
            const numeroIndex = tokens.indexOf(String(numero));
            if (labelIndex === -1) return false;
            if (numeroIndex === -1) return false;
            if (numeroIndex < labelIndex) return false;
            if (numeroIndex - labelIndex > 2) return false;
            return true;
        },
    );

const hasPostalAddress = (address, structure) => (
    address.includes((structure.ville_postale_appauvrie || '**').split(' cedex')[0])
    || address.includes(String(structure.code_postal) || '**')
);

/**
 * Say if the `structure` is in `address` according to the presence of
 * `intitule`.
 *
 * @param {string} address
 * @param {Structure} structure
 * @returns {boolean}
 * @private
 */
const hasIntitule = (address, structure) => address.includes(structure.intituleAppauvri || '**');

/**
 * Say if the `structure` is in `address` according to the presence of sigle.
 *
 * @param {string} address
 * @param {Structure} structure
 * @returns {boolean}
 * @private
 */
const hasSigle = (address, structure) => address.split(/[ -,/]/).includes(structure.sigleAppauvri || '**');

/**
 * Check that for at least one of the tutelles (`structure.etabAssoc.*.etab`):
 * - either `etab.libelle` starts with `Université` and `etab.libelle`
 *   is in `address` (but not the `sigle`).
 * - either `etab.sigle` or `etab.libelle` is in `address`
 *
 * @param {string} address
 * @param {Structure} structure
 * @returns {boolean}
 * @private
 */
export const hasTutelle = (address, structure) => {
    const tutelles = structure.etabAssoc
        .map((ea) => ea.etab);
    const structureHasTutelle = tutelles.reduce((keep, etab) => {
        if (etab.libelleAppauvri.startsWith('universit')) {
            if (address.includes(etab.libelleAppauvri)) {
                return true;
            }
        } else if (address.includes(etab.sigleAppauvri || '**')
            || address.includes(etab.libelleAppauvri || '**')) {
            return true;
        }
        return keep;
    }, false);
    return structureHasTutelle;
};

/**
 * Checks that structure has etabAssocs
 * @param {Structure} structure
 * @returns {boolean}
 * @private
 */
export const hasEtabAssocs = (structure) => {
    if (!structure.etabAssoc) return false;
    if (!structure.etabAssoc[0]) return false;
    return true;
};

/**
 * Say if the `structure` is in `address` according to the presence of label and
 * numero.
 *
 * @export
 * @param {string} address
 * @param {Structure} structure
 * @returns {boolean}
 * @private
 */
export const hasLabelAndNumero = (address, structure) => {
    if (!hasLabel(address, structure.etabAssoc)) return false;
    if (!hasNumero(address, structure.etabAssoc)) return false;
    const tokens = address.split(/[ -,:;]/);
    if (!followsNumeroLabel(tokens, structure.etabAssoc)) return false;
    return true;
};

/**
 * Check whether or not the `structure` is found in the `address`.
 *
 * @export
 * @param {string}  address depleted address (without accents, lowercase)
 * @private
 */
export function isIn(address) {
    /**
     * Check that the `address` from the closure contains the `structure`.
     *
     * @param {Structure} structure
     * @returns {boolean}
     * @private
     */
    function isInAddress(structure) {
        const result = hasEtabAssocs(structure)
        && hasPostalAddress(address, structure)
        && hasTutelle(address, structure)
        && (
            hasSigle(address, structure)
            || hasIntitule(address, structure)
            || hasLabelAndNumero(address, structure)
        );
        return result;
    }
    return isInAddress;
}

// RNSR File

/**
 * Cache the different years of RNSR
 * @type {Object<number,RepNatStrRech>}
 * @private
 */
const loadedRNSR = {};

/**
  * Get the RNSR of year
  * @param {number}  year    4 digits year of RNSR to load
  * @returns {Promise<RepNatStrRech|null>}
  * @private
  */
export async function getRnsrYear(year) {
    if (loadedRNSR[year]) return loadedRNSR[year];
    const filePath = path.resolve(__dirname, `../data/RNSR-${year}.json`);
    const rnsr = JSON.parse(await fs.promises.readFile(filePath, { encoding: 'utf-8' }));
    loadedRNSR[year] = rnsr;
    return rnsr;
}

const isValidYear = (min, max) => (year) => {
    if (min > year) return false;
    if (max && max < year) return false;
    return true;
};

export const existedInYear = (year) => (structure) => {
    if (year === undefined) return true;
    const createdAt = Number(structure.annee_creation);
    const closedAt = structure.an_fermeture && Number(structure.an_fermeture);
    const checkInterval = isValidYear(createdAt, closedAt);
    return checkInterval(year);
};
