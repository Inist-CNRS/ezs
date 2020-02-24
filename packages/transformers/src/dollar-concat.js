import transformer from './operations/CONCAT';
import dollar from './dollar';

/**
 * concaténer deux valeurs
 *
 * @param {String} [path] field path to apply the transformation
 * @param {String} [value] value to use during the transformation
 * @returns {Object}
 */
export default function $CONCAT(data, feed) {
    return dollar(this, data, feed, transformer);
}
