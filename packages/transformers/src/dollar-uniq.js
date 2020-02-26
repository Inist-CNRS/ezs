import transformer from './operations/UNIQ';
import dollar from './dollar';

/**
 * dédoublonne les valeurs (dans un tableau)
 *
 * @param {String} [path] field path to apply the transformation
 * @param {String} [value] value to use during the transformation
 * @returns {Object}
 */
export default function $UNIQ(data, feed) {
    return dollar(this, data, feed, transformer);
}
