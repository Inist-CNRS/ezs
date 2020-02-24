import transformer from './operations/ARRAY';
import dollar from './dollar';

/**
 * transformer une chaîne de caractères en tableau avec un seul element
 *
 * @param {String} [path] field path to apply the transformation
 * @param {String} [value] value to use during the transformation
 * @returns {Object}
 */
export default function $ARRAY(data, feed) {
    return dollar(this, data, feed, transformer);
}
