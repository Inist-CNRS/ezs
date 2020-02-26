import transformer from './operations/DEFAULT';
import dollar from './dollar';

/**
 * donner une valeur par défaut
 *
 * @param {String} [path] field path to apply the transformation
 * @param {String} [value] value to use during the transformation
 * @returns {Object}
 */
export default function $DEFAULT(data, feed) {
    return dollar(this, data, feed, transformer);
}
