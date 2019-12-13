import get from 'lodash.get';

/**
 * Take `Object` and throw the same object only if the value of the selected
 * field is greater (or equal) than a value
 *
 * ```json
 * [{
 * }]
 * ```
 *
 * Script:
 *
 * ```ini
 * [use]
 * plugin = analytics
 *
 * [greater]
 *
 * ```
 *
 * Output:
 *
 * ```json
 * [
 * ]
 * ```
 *
 * @name greater
 * @param {String} [path="value"] path of the field to compare
 * @param {Number} [than=0] value to compare
 * @param {Boolean} [strict=false] greater than but not equal
 * @returns {Object}
 */
export default function greater(data, feed) {
    if (this.isLast()) {
        feed.close(); return;
    }
    const strict = Boolean(this.getParam('strict', false));
    const than = Number(this.getParam('than')) || 0;
    const path = this.getParam('path', 'value');
    const key = Array.isArray(path) ? path.shift() : path;
    const value = Number(get(data, key)) || 0;

    if ((!strict && value >= than) || (strict && value > than)) {
        feed.send(data);
    } else {
        feed.end();
    }
}
