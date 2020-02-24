import transformer from './operations/VALUE';
import dollar from './dollar';

/**
 * Fixer une valeur
 *
 * @param {String} [path] field path to apply the transformation
 * @param {String} [value] value to use during the transformation
 * @returns {Object}
 */
export default function $VALUE(data, feed) {
    return dollar(this, data, feed, transformer);
}
