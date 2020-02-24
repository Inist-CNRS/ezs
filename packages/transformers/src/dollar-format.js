import transformer from './operations/FORMAT';
import dollar from './dollar';

/**
 * appliquer un patron (template)
 *
 * @param {String} [path] field path to apply the transformation
 * @param {String} [value] value to use during the transformation
 * @returns {Object}
 */
export default function $FORMAT(data, feed) {
    return dollar(this, data, feed, transformer);
}
