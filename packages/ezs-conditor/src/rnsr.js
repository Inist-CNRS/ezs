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
 * @property {string} intituleAppauvri
 * @property {string} sigle
 * @property {string} sigleAppauvri
 * @property {number} [annee_creation]
 * @property {number} [an_der_rec]
 * @property {number} [an_fermeture]
 * @property {number} code_postal
 * @property {string} ville_postale
 * @property {string} ville_postale_appauvrie
 * @property {EtabAssoc[]} etabAssoc
 */

/**
 * @typedef {Object<string, any>} EtabAssoc
 * @property {"TUTE"|"PART"} [natTutEtab]
 * @property {Etab} etab
 * @property {number} [anDebut]
 * @property {number} [anFin]
 * @property {string} [idStructEtab]
 * @property {string} label
 * @property {string} labelAppauvri
 * @property {number} numero
 */

/**
 * @typedef {Object<string, any>} Etab
 * @property {string} [cleEtab]
 * @property {string} sigle
 * @property {string} sigleAppauvri
 * @property {string} libelle
 * @property {string} libelleAppauvri
 * @property {string} [numUAI]
 * @property {string} [SirenSiret]
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
 */
const followsNumeroLabel = (tokens, etabAssocs) => etabAssocs[0]
    && etabAssocs.some(
        (etabAssoc) => {
            const { labelAppauvri: label, numero } = etabAssoc;
            if (tokens.includes(`${label}${numero}`)) return true;
            const labelIndex = tokens.indexOf(label.toLowerCase());
            const numeroIndex = tokens.indexOf(String(numero));
            if (labelIndex === -1) return false;
            if (numeroIndex === -1) return false;
            if (numeroIndex < labelIndex) return false;
            if (numeroIndex - labelIndex > 1) return false;
            return true;
        },
    );
const hasPostalAddress = (address, structure) => (
    address.includes(structure.ville_postale_appauvrie || '**')
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
const hasIntitule = (address, structure) => address.includes(structure.intituleAppauvri || '**');

/**
 * Say if the `structure` is in `address` according to the presence of sigle.
 *
 * @param {string} address
 * @param {Structure} structure
 * @returns {boolean}
 */
const hasSigle = (address, structure) => address.includes(structure.sigleAppauvri || '**');

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
    const tutelles = structure.etabAssoc
        .map((ea) => ea.etab);
    return tutelles.reduce((keep, etab) => {
        if (etab.libelleAppauvri.startsWith('universit')) {
            if (address.includes(etab.libelleAppauvri || '**')) {
                return true;
            }
        } else if (address.includes(etab.sigleAppauvri || '**')
            || address.includes(etab.libelleAppauvri || '**')) {
            return true;
        }
        return keep;
    }, false);
};

/**
 * Checks that structure has etabAssocs
 * @param {Structure} structure
 * @returns {boolean}
 */
const hasEtabAssocs = (structure) => {
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
 */
export const hasLabelAndNumero = (address, structure) => {
    if (!hasLabel(address, structure.etabAssoc)) return false;
    if (!hasNumero(address, structure.etabAssoc)) return false;
    const tokens = address.split(/[ -]/);
    if (!followsNumeroLabel(tokens, structure.etabAssoc)) return false;
    return true;
};

/**
 * Check whether or not the `structure` is found in the `address`.
 *
 * @export
 * @param {string}  address depleted address (without accents, lowercase)
 * @returns {Function} a function that look for the `structure` within `address`
 */
export const isIn = (address) => (/** {Structure} */structure) => (
    hasEtabAssocs(structure)
    && hasPostalAddress(address, structure)
    && hasTutelle(address, structure)
    && (
        hasSigle(address, structure)
        || hasIntitule(address, structure)
        || hasLabelAndNumero(address, structure)
    )
);
