import transformer from './operations/NUMBER';
import dollar from './dollar';

/**
 * transformer une chaîne de caractères en nombre
 * 
 * @param {String} [path] field path to apply the transformation
 * @param {String} [value] value to use during the transformation
 * @returns {Object}
 */
export default function $NUMBER(data, feed) {
    return dollar(this, data, feed, transformer);
}
