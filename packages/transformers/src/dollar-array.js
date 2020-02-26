import transformer from './operations/ARRAY';
import dollar from './dollar';

/**
 * transformer une chaîne de caractères en tableau avec un seul element
 *
 * Exemple :
 *
 * ```ini
 * [$ARRAY]
 * field = keywords
 * ```
 *
 * @param {String} [field] field path to apply the transformation
 * @returns {Object}
 */
export default function $ARRAY(data, feed) {
    return dollar(this, data, feed, transformer);
}
