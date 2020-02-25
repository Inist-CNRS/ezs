/**
 * Take `Object` and throw un new item computed by the value= parameter
 * Input file:
 *
 * ```json
 * [{
 *    a: 'abcdefg',
 *    b: '1234567',
 *    c: 'XXXXXXX',
 * },
 * {
 *    a: 'abcdefg',
 *    b: '1234567',
 *    c: 'XXXXXXX',
 * }]
 * ```
 *
 * Script:
 *
 * ```ini
 * [exchange]
 * value = omit('c')
 *
 * ```
 *
 * Output:
 *
 * ```json
 * [{
 *    a: 'abcdefg',
 *    b: '1234567',
 * },
 * {
 *    a: 'abcdefg',
 *    b: '1234567',
 * }]
 * ```
 *
 * @name exchange
 * @param {String} [value] value to replace input object
 * @returns {Object}
 */
export default function exchange(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const value = this.getParam('value', []);
    const values = Array.isArray(value) ? value : [value];

    if (values.length === 1) {
        return feed.send(values.shift());
    }
    return feed.send(values);
}
