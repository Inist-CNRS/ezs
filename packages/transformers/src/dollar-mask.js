import transformer from './operations/MASK';
import dollar from './dollar';

/**
 * S'assure que la valeur respecte une expression régulière
 *
 * @param {String} [path] field path to apply the transformation
 * @param {String} [value] value to use during the transformation
 * @returns {Object}
 */
export default function $MASK(data, feed) {
    return dollar(this, data, feed, transformer);
}
