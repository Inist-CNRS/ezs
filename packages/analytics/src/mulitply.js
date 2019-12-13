import set from 'lodash.set';
import clone from 'lodash.clone';

/**
 * Take `Object` and throw the same object only if there the value of the select field is equals than a value
  * Input file:
 *
 * ```json
 * [{
 *    a: 1,
 *    b: 2,
 * }]
 * ```
 *
 * Script:
 *
 * ```ini
 * [use]
 * plugin = analytics
 *
 * [multiply]
 * path = factor
 * value = X
 * value = Y
 * value = Z
 *
 * ```
 *
 * Output:
 *
 * ```json
 * [{
 *    a: 1,
 *    b: 2,
 *    factor: X
 * },
 * {
 *    a: 1,
 *    b: 2,
 *    factor: Y
 * },
 * {
 *    a: 1,
 *    b: 2,
 *    factor: Z
 * },
 * ]
 * ```
 *
 * @export
 * @name multiply
 * @param {String} [path="factor"] path of the field to add
 * @param {String} [value=""] value(s) to set factor field
 * @returns {Object}
 */
export default function multiply(data, feed) {
    if (this.isLast()) {
        feed.close();
        return;
    }
    const path = this.getParam('path', 'factor');
    const key = Array.isArray(path) ? path.shift() : path;
    const value = this.getParam('value', []);
    const values = Array.isArray(value) ? value : [value];

    if (!value.length || !key) {
        feed.send(data);
        return;
    }
    values.forEach((x) => {
        feed.write(set(clone(data), key, x));
    });
    feed.end();
}
