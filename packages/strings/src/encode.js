import { get, set } from 'lodash';

/**
 * Encodes a given string using a provided mapping, replacing characters that
 * match keys in the mapping with their corresponding values. Optionally, a
 * prefix and suffix can be added to the final result.
 *
 * @param {string} string - The string to be encoded.
 * @param {Record<string, string>} mapping - An object where keys are characters
 *                              to be replaced and values are their replacements.
 * @param {string} before - An optional string to be added to the beginning of
 *                          each replaced character.
 * @param {string} after - An optional string to be added to the end of each
 *                         replaced character.
 * @return {string} The encoded string with optional prefix and/or suffix.
 * @private
 */
const encodeString = (string, mapping, before = '', after = '') => {
    let encoded = string;
    // eslint-disable-next-line guard-for-in, no-restricted-syntax
    for (const key in mapping) {
        encoded = encoded.replace(RegExp(key, 'g'), before + mapping[key] + after);
    }
    return encoded;
};


/**
 * Encodes a given string using a provided mapping, replacing characters with
 * their mapping, and optional prefix and suffix.
 *
 * Input:
 *
 * ```json
 * [{
 *     "id": "1",
 *     "value": "Flow control based 5 MW wind turbine",
 * }, {
 *     "id": "2",
 *     "value": "Motion Characteristics of 10 MW Superconducting Floating Offshore Wind Turbine",
 * }]
 * ```
 *
 * Script:
 *
 * ```ini
 * [encode]
 * from = 1
 * to = one
 * from = 5
 * to = five
 * from = 0
 * to = zero
 * prefix = inf
 * suffi = sup
 * ```
 *
 * Output:
 *
 * ```json
 * [{
 *     "id": "1",
 *     "value": "Flow control based inffivesup MW wind turbine",
 * }, {
 *     "id": "2",
 *     "value": "Motion Characteristics of infonesupinfzerosup MW Superconducting Floating Offshore Wind Turbine",
 * }]
 * ```
 *
 * @name encode
 * @param {string} path the path of the string to encode
 * @param {string[]} from the characters to encode
 * @param {string[]} to the characters to put in place
 * @param {string} before the prefix to add
 * @param {string} after the suffix to add
 * @exports
 * @returns
 */
export default function encode (data, feed, ctx) {
    const path = ctx.getParam('path', []);
    const before = ctx.getParam('before', '');
    const after = ctx.getParam('after', '');
    const from = ctx.getParam('from', []);
    const to = ctx.getParam('to', []);

    if (ctx.isLast()) {
        return feed.close();
    }

    const mapping = from.reduce((acc, cur, i) => ({ ...acc, [cur]: to[i] }), {});
    const value = get(data, path);
    const newValue = encodeString(value, mapping, before, after);
    const newData = set(data, path, newValue);
    return feed.send(newData);
}
