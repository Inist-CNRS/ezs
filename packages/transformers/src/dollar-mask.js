import transformer from './operations/MASK';
import dollar from './dollar';

/**
 * S'assure que la valeur respecte une expression régulière
 *
 * Exemple :
 *
 * ```ini
 * [$MASK]
 * field = title
 * with = ^[a-z]+$
 * ```
 *
 * @param {String} [path] field path to apply the control
 * @param {String} [value] value to use during the transformation
 * @returns {Object}
 */
export default function $MASK(data, feed) {
    return dollar(this, data, feed, transformer);
}
