import transformer from './operations/LOWERCASE';
import dollar from './dollar';

/**
 * mettre en bas de casse (minuscules)
 *
 * @param {String} [path] field path to apply the transformation
 * @param {String} [value] value to use during the transformation
 * @returns {Object}
 */
export default function $LOWERCASE(data, feed) {
    return dollar(this, data, feed, transformer);
}
