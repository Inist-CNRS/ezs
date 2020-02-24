import transformer from './operations/SPLIT';
import dollar from './dollar';

/**
 * segmente une chaîne de caractères en tableau
 *
 * @param {String} [path] field path to apply the transformation
 * @param {String} [value] value to use during the transformation
 * @returns {Object}
 */
export default function $SPLIT(data, feed) {
    return dollar(this, data, feed, transformer);
}
