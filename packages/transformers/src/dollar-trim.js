import transformer from './operations/TRIM';
import dollar from './dollar';

/**
 *  enlève les espaces au début et à la fin d'une chaîne de caractères
 *
 * @param {String} [path] field path to apply the transformation
 * @param {String} [value] value to use during the transformation
 * @returns {Object}
 */
export default function $TRIM(data, feed) {
    return dollar(this, data, feed, transformer);
}
