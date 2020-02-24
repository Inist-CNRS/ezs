import transformer from './operations/SUFFIX';
import dollar from './dollar';

/**
 * ajoute une chaîne de caractères à la fin d'une chaîne ou d'un tableau
 *
 * @param {String} [path] field path to apply the transformation
 * @param {String} [value] value to use during the transformation
 * @returns {Object}
 */
export default function $SUFFIX(data, feed) {
    return dollar(this, data, feed, transformer);
}
