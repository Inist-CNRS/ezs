import transformer from './operations/UPPERCASE';
import dollar from './dollar';

/**
 * mettre la chaîne en majuscules
 *
 * @param {String} [path] field path to apply the transformation
 * @param {String} [value] value to use during the transformation
 * @returns {Object}
 */
export default function $UPPERCASE(data, feed) {
    return dollar(this, data, feed, transformer);
}
