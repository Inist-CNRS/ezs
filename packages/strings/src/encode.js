import { get, set } from 'lodash';

/**
 * Encodes a given string using a provided mapping, replacing characters that
 * match keys in the mapping with their corresponding values. Optionally, a
 * prefix and suffix can be added to the final result.
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
 * suffix = sup
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
 * @param {string} path - The path of the string to be encoded, within data.
 * @param {string[]} from - An array of characters to replace.
 * @param {string[]} to - An array of characters to replace with.
 * @param {string} prefix - An optional string to be added to the beginning of
 *                          each replaced character.
 * @param {string} suffix - An optional string to be added to the end of each
 *                         replaced character.
 * @exports
 */
const encodeString = (data, path, from, to, prefix, suffix) => {
    const string = path ? get(data, path) : data;
    const encoded = from.reduce(
        (str, fromI, i) => str.replace(
            RegExp(fromI, 'g'),
            prefix + to[i] + suffix
        ),
        string
    );
    const newData = path ? set(data, path, encoded) : encoded;
    return newData;
};

export default function encodeStatement (data, feed, ctx) {
    const path = ctx.getParam('path', '');
    const prefix = ctx.getParam('prefix', '');
    const suffix = ctx.getParam('suffix', '');
    const from = ctx.getParam('from', []);
    const to = ctx.getParam('to', []);

    if (ctx.isLast()) {
        return feed.close();
    }

    const newData = encodeString(data, path, from, to, prefix, suffix);
    return feed.send(newData);
}
