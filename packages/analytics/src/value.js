import get from 'lodash.get';

/**
 * Take `Object` object and getting the value field
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
 * [value]
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
 * @name value
 * @param {String} [path=value] the pah of the value field
 * @returns {Object}
 */
export default function value(data, feed) {
    if (this.isLast()) {
        feed.close();
        return;
    }
    const path = this.getParam('path', 'value');
    const fields = Array.isArray(path) ? path : [path];

    const val = fields
        .filter((k) => typeof k === 'string')
        .map((key) => get(data, key))
        .filter((x) => x)
        // eslint-disable-next-line no-unexpected-multiline
        [0];
    feed.send(val);
}
