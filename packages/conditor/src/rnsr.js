/**
 * @typedef {Object<string, any>} RepNatStrRech
 * @property {Structures} structures
 * @private
 */

/**
 * @typedef {Object<string, any>} Structures
 * @property {Object} origineDonnees
 * @property {Structure[]} structure
 * @private
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
 * @private
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
 * @private
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
const followsNumeroLabel = (tokens, etabAssocs) => etabAssocs[0]
    && etabAssocs.some(
        (etabAssoc) => {
            const { labelAppauvri: label, numero } = etabAssoc;
            const result = tokens.match(new RegExp(`(${label}( [\w]+)? ${numero})`, 'gm'));
            return Array.isArray(result) && result.length > 0;
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
 * Say if `target` items are in `arr`.
 * `target` items should be sorted
 *
 * @param {arr} address
 * @param {target} structure
 * @returns {boolean}
 * @private
 */
const contain = (arr, target) => {
    if (arr.length < target.length) return false;
    const indexes = target.map((x) => arr.indexOf(x));
    let sorted = true;
    if (indexes.length === 1) return indexes[0] > -1;
    for (let i = 0; i < indexes.length - 1; i += 1) {
        if (indexes[i] === -1 || indexes[i + 1] === -1 || indexes[i] > indexes[i + 1]) {
            sorted = false;
            break;
        }
    }
    return sorted;
};

/**
 * Say if the `structure` is in `address` according to the presence of sigle.
 *
 * @param {string} address
 * @param {Structure} structure
 * @returns {boolean}
 * @private
 */
const hasSigle = (address, structure) => contain(address.split(/[ \-,]/), structure.sigleAppauvri.split(' '));

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
 * @private
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
 * @private
 */
export const hasLabelAndNumero = (address, structure) => {
    if (!hasLabel(address, structure.etabAssoc)) return false;
    if (!hasNumero(address, structure.etabAssoc)) return false;
    const tokens = address.replace(/[ \-,]+/gm, ' ');
    if (!followsNumeroLabel(tokens, structure.etabAssoc)) return false;
    return true;
};

/**
 * Check whether or not the `structure` is found in the `address`.
 *
 * @export
 * @param {string}  address depleted address (without accents, lowercase)
 * @returns {Function} a function that look for the `structure` within `address`
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
        return hasEtabAssocs(structure)
        && hasPostalAddress(address, structure)
        && hasTutelle(address, structure)
        && (
            hasSigle(address, structure)
            || hasIntitule(address, structure)
            || hasLabelAndNumero(address, structure)
        );
    }
    return isInAddress;
}
