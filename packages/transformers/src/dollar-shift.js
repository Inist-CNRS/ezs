import transformer from './operations/SHIFT';
import dollar from './dollar';

/**
 * décaler une valeur multiple (tableau ou chaîne de caractères)
 *
 * @param {String} [path] field path to apply the transformation
 * @param {String} [value] value to use during the transformation
 * @returns {Object}
 */
export default function $SHIFT(data, feed) {
    return dollar(this, data, feed, transformer);
}
