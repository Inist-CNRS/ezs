import transformer from './operations/COLUMN';
import dollar from './dollar';

/**
 * prendre une donnée dans un champ (colonne d'un fichier tabulé)
 *
 * @param {String} [path] field path to apply the transformation
 * @param {String} [value] value to use during the transformation
 * @returns {Object}
 */
export default function $COLUMN(data, feed) {
    return dollar(this, data, feed, transformer);
}
