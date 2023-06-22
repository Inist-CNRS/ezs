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
 * path = value
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
 * > ⚠ The replacements are made in the order of the `from` array. This means
 * > that if 1 is replaced with 2, and next 2 replaced with 3, a 1 is eventually
 * > replaced with 3.
 *
 * > ⚠ You must give as much `from` as `to`.
 *
 * @name encode
 * @param {string} path - The path of the string to be encoded, within data.
 * @param {string[]} from - An array of strings to replace.
 * @param {string[]} to - An array of strings to replace with.
 * @param {string} [prefix=""] - A string to be added to the beginning of each
 *                          replaced substring.
 * @param {string} [suffix=""] - A string to be added to the end of each
 *                         replaced substring.
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

    if (from.length !== to.length) {
        return feed.send(new Error('from and to must have the same length'));
    }

    const newData = encodeString(data, path, from, to, prefix, suffix);
    return feed.send(newData);
}
