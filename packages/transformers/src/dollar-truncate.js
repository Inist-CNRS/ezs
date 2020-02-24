import transformer from './operations/TRUNCATE';
import dollar from './dollar';

/**
 * tronque, prend les premières valeurs d'un tableau, d'une chaîne
 *
 * @param {String} [path] field path to apply the transformation
 * @param {String} [value] value to use during the transformation
 * @returns {Object}
 */
export default function $TRUNCATE(data, feed) {
    return dollar(this, data, feed, transformer);
}
