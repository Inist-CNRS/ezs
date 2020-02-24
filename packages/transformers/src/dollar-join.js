import transformer from './operations/JOIN';
import dollar from './dollar';

/**
 * Rassemble les valeurs d'un tableau en une chaîne de caractères
 *
 * @param {String} [path] field path to apply the transformation
 * @param {String} [value] value to use during the transformation
 * @returns {Object}
 */
export default function $JOIN(data, feed) {
    return dollar(this, data, feed, transformer);
}
