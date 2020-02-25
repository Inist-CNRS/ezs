import transformer from './operations/AUTOGENERATE_URI';
import dollar from './dollar';

/**
 * générer automatiquement des identifiants
 *
 * @param {String} [path] field path to apply the transformation
 * @param {String} [value] value to use during the transformation
 * @returns {Object}
 */
export default function $AUTOGENERATE_URI(data, feed) {
    return dollar(this, data, feed, transformer, data);
}
