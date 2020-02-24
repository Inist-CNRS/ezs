import transformer from './operations/PARSE';
import dollar from './dollar';

/**
 * Analyser un chaine de caractère comme étant du JSON
 *
 * @param {String} [path] field path to apply the transformation
 * @param {String} [value] value to use during the transformation
 * @returns {Object}
 */
export default function $PARSE(data, feed) {
    return dollar(this, data, feed, transformer);
}
