import _ from 'lodash';

/**
 * Take `Object` and throw each value of fields
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
 * [extract]
 * path = a
 * path = b
 *
 * ```
 *
 * Output:
 *
 * ```json
 * [
 *    'abcdefg',
 *    '1234567',
 *    'abcdefg',
 *    '1234567',
 * }]
 * ```
 *
 * @name extract
 * @param {String} [path] path of field to extract
 * @returns {Object}
 */
export default function extract(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    let keys = this.getParam('path', []);
    if (!Array.isArray(keys)) {
        keys = [keys];
    }

    keys = keys.filter((k) => typeof k === 'string');
    const values = keys.map((key) => _.get(data, key)).filter((val) => val);

    if (values.length === 0) {
        return feed.send(new Error('Nonexistent path.'));
    } if (values.length === 1) {
        return feed.send(values[0]);
    }
    return feed.send(values);
}
