import transformer from './operations/BOOLEAN';
import dollar from './dollar';

/**
 * transformer une chaîne de caractères en booléen
 *
  Exemple :
 *
 * ```ini
 * [$BOOLEAN]
 * field = haveMoney
 * ```
 *
 * @param {String} [field] field path to apply the transformation
 * @returns {Object}
 */
export default function $BOOLEAN(data, feed) {
    return dollar(this, data, feed, transformer);
}
