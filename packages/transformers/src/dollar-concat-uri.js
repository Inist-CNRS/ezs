import transformer from './operations/CONCAT_URI';
import dollar from './dollar';

/**
 * compoer un identifiant avec plsuieurs champs
 *
 * @param {String} [path] field path to apply the transformation
 * @param {String} [value] value to use during the transformation
 * @returns {Object}
 */
export default function $CONCAT_URI(data, feed) {
    return dollar(this, data, feed, transformer);
}
