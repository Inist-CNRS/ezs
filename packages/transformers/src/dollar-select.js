import transformer from './operations/SELECT';
import dollar from './dollar';

/**
 * Prendre une valeir dans un objet à partir de son chemin (dot path)
 *
 * @param {String} [path] field path to apply the transformation
 * @param {String} [value] value to use during the transformation
 * @returns {Object}
 */
export default function $SELECT(data, feed) {
    return dollar(this, data, feed, transformer);
}
