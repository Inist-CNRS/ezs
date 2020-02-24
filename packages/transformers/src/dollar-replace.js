import transformer from './operations/REPLACE';
import dollar from './dollar';

/**
 * remplacer une chaîne par une autre
 *
 * @param {String} [path] field path to apply the transformation
 * @param {String} [value] value to use during the transformation
 * @returns {Object}
 */
export default function $REPLACE(data, feed) {
    return dollar(this, data, feed, transformer);
}
