import transformer from './operations/CAPITALIZE';
import dollar from './dollar';

/**
 * mettre le premier caractère en majuscule
 *
 * @param {String} [path] field path to apply the transformation
 * @param {String} [value] value to use during the transformation
 * @returns {Object}
 */
export default function $CAPITALIZE(data, feed) {
    return dollar(this, data, feed, transformer);
}
