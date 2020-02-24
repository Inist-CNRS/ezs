import transformer from './operations/PREFIX';
import dollar from './dollar';

/**
 * préfixer la valeur avec une chaîne de caractères
 *
 * @param {String} [path] field path to apply the transformation
 * @param {String} [value] value to use during the transformation
 * @returns {Object}
 */
export default function $PREFIX(data, feed) {
    return dollar(this, data, feed, transformer);
}
