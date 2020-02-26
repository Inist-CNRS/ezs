import transformer from './operations/STRING';
import dollar from './dollar';

/**
 * transforme la valeur en chaîne de caractères
 *
 * @param {String} [path] field path to apply the transformation
 * @param {String} [value] value to use during the transformation
 * @returns {Object}
 */
export default function $STRING(data, feed) {
    return dollar(this, data, feed, transformer);
}
