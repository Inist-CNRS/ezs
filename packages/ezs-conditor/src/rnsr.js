import { promises } from 'fs';
import xmlParser from 'fast-xml-parser';

/**
 * @typedef {Object<string, any>} RepNatStrRech
 * @property {Structures} structures
 */

/**
 * @typedef {Object<string, any>} Structures
 * @property {Object} origineDonnees
 * @property {Structure[]} structure
 */

/**
 * @typedef {Object<string, any>} Structure
 * @property {string} num_nat_struct
 * @property {string} intitule
 * @property {string} sigle
 * @property {number} annee_creation
 * @property {number} an_der_rec
 * @property {number} [an_fermeture]
 * @property {number} code_postal
 * @property {string} ville_postale
 * @property {EtabAssoc[]} etabAssoc
 */

/**
 * @typedef {Object<string, any>} EtabAssoc
 * @property {"TUTE"|"PART"} natTutEtab
 * @property {Etab} etab
 * @property {number} anDebut
 * @property {number} [anFin]
 * @property {string} idStructEtab
 * @property {string} label
 * @property {number} numero
 */

/**
 * @typedef {Object<string, any>} Etab
 * @property {string} cleEtab
 * @property {string} sigle
 * @property {string} libelle
 * @property {string} numUAI
 * @property {string} SirenSiret
 */

const hasLabel = (address, etabAssocs) => etabAssocs[0] && etabAssocs.some(
    (etabAssoc) => address.includes(etabAssoc.label || '**'),
);
const hasNumero = (address, etabAssocs) => etabAssocs[0] && etabAssocs.some(
    (etabAssoc) => address.includes(String(etabAssoc.numero) || '**'),
);
/**
 * Say if numero follows label (optionnally with one token between both, or
 * without separator).
 * @param {string[]} tokens
 * @param {EtabAssoc[]} etabAssocs
 * @returns {boolean}
 */
const followsNumeroLabel = (tokens, etabAssocs) => etabAssocs[0]
    && etabAssocs.some(
        (etabAssoc) => {
            const { label, numero } = etabAssoc;
            if (tokens.includes(`${label}${numero}`)) return true;
            const labelIndex = tokens.indexOf(label);
            const numeroIndex = tokens.indexOf(String(numero));
            if (labelIndex === -1) return false;
            if (numeroIndex === -1) return false;
            if (numeroIndex < labelIndex) return false;
            if (numeroIndex - labelIndex > 1) return false;
            return true;
        },
    );
const hasPostalAddress = (address, structure) => (
    address.includes(structure.ville_postale || '**')
    || address.includes(String(structure.code_postal) || '**')
);

/**
 * Say if the `structure` is in `address` according to the presence of
 * `intitule`.
 *
 * @param {string} address
 * @param {Structure} structure
 * @returns {boolean}
 */
const hasIntitule = (address, structure) => address.includes(structure.intitule || '**');

/**
 * Say if the `structure` is in `address` according to the presence of sigle.
 *
 * @param {string} address
 * @param {Structure} structure
 * @returns {boolean}
 */
const hasSigle = (address, structure) => address.includes(structure.sigle || '**');

/**
 * Check that for at least one of the tutelles (`structure.etabAssoc.*.etab`):
 * - either `etab.libelle` starts with `Université` and `etab.libelle`
 *   is in `address` (but not the `sigle`).
 * - either `etab.sigle` or `etab.libelle` is in `address`
 *
 * @param {string} address
 * @param {Structure} structure
 * @returns {boolean}
 */
const hasTutelle = (address, structure) => {
    if (!structure.etabAssoc) return false;
    if (!structure.etabAssoc[0]) return false;
    const tutelles = structure.etabAssoc
        .filter((ea) => ea.natTutEtab === 'TUTE')
        .map((ea) => ea.etab);
    return tutelles.reduce((keep, etab) => {
        if (etab.libelle.startsWith('Université')
            && address.includes(etab.libelle || '**')) {
            return true;
        }
        if (address.includes(etab.sigle || '**')
            || address.includes(etab.libelle || '**')) {
            return true;
        }
        return keep;
    }, false);
};

/**
 * Say if the `structure` is in `address` according to the presence of label and
 * numero.
 *
 * @export
 * @param {string} address
 * @param {Structure} structure
 * @returns {boolean}
 */
export const hasLabelAndNumero = (address, structure) => {
    if (!hasLabel(address, structure.etabAssoc)) return false;
    if (!hasNumero(address, structure.etabAssoc)) return false;
    const tokens = address.split(/[ -]/);
    if (!followsNumeroLabel(tokens, structure.etabAssoc)) return false;
    return true;
};

export const isIn = (address) => (/** {Structure} */structure) => (
    hasPostalAddress(address, structure)
    && hasTutelle(address, structure)
    && (
        hasSigle(address, structure)
        || hasIntitule(address, structure)
        || hasLabelAndNumero(address, structure)
    )
);

/**
 * Get the RNSR object from the file.
 *
 * @export
 * @returns {Promise<RepNatStrRech>}
 */
export async function getRNSR() {
    const RNSRXML = await promises.readFile(`${__dirname}/../data/RNSR.xml`, {
        encoding: 'utf8',
    });
    const RNSR = xmlParser.parse(RNSRXML, {
        ignoreAttributes: true,
        ignoreNameSpace: true,
        trimValues: true,
    });
    return RNSR;
}
