import transformer from './operations/REMOVE';
import dollar from './dollar';

/**
 * supprimer un élément ou une sous-chaîne
 *
 * @param {String} [path] field path to apply the transformation
 * @param {String} [value] value to use during the transformation
 * @returns {Object}
 */
export default function $REMOVE(data, feed) {
    return dollar(this, data, feed, transformer);
}
