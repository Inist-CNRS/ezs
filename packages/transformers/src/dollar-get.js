import transformer from './operations/GET';
import dollar from './dollar';

/**
 * Récupére toutes les valeurs correspondant à un chemin (dot path)
 *
 * @param {String} [path] field path to apply the transformation
 * @param {String} [value] value to use during the transformation
 * @returns {Object}
 */
export default function $GET(data, feed) {
    return dollar(this, data, feed, transformer);
}
