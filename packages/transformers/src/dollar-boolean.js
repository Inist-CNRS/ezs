import transformer from './operations/BOOLEAN';
import dollar from './dollar';

/**
 * transformer une chaîne de caractères en booléen
 *
 * @param {String} [path] field path to apply the transformation
 * @param {String} [value] value to use during the transformation
 * @returns {Object}
 */
export default function $BOOLEAN(data, feed) {
    return dollar(this, data, feed, transformer);
}
