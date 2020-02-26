import transformer from './operations/URLENCODE';
import dollar from './dollar';

/**
 * encode une chaine comme dans une URL
 *
 * @param {String} [path] field path to apply the transformation
 * @param {String} [value] value to use during the transformation
 * @returns {Object}
 */
export default function $URLENCODE(data, feed) {
    return dollar(this, data, feed, transformer);
}
