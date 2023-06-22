import get from 'lodash.get';
import set from 'lodash.set';

/**
 * Decodes a given string using a provided mapping, replacing strings that
 * match values (to)in the mapping with their corresponding keys (from). Optionally, a
 * prefix and suffix can be set (they are removed too from strings).
 *
 * This statement is the reverse of `encode`.
 *
 * Input:
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
 * Script:
 *
 * ```ini
 * [decode]
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
 *     "value": "Flow control based 5 MW wind turbine",
 * }, {
 *     "id": "2",
 *     "value": "Motion Characteristics of 10 MW Superconducting Floating Offshore Wind Turbine",
 * }]
 * ```
 *
 * > ⚠ You must give as much `from` as `to`.
 *
 * @name decode
 * @param {string} path - The path of the string to be decoded, within data.
 * @param {string[]} from - An array of strings to replace with.
 * @param {string[]} to - An array of strings to be replaced.
 * @param {string} [prefix=""] - A string to be removed from the beginning of each
 *                          replaced substring.
 * @param {string} [suffix=""] - A string to be removed from the end of each
 *                         replaced substring.
 * @exports
 * @see encode
 */
const decodeString = (data, path, from, to, prefix, suffix) => {
    const string = path ? get(data, path) : data;
    const encoded = from.reduce(
        (str, fromI, i) => str.replace(
            prefix + to[i] + suffix,
            fromI,
        ),
        string
    );
    const newData = path ? set(data, path, encoded) : encoded;
    return newData;
};

export default function decodeStatement (data, feed, ctx) {
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

    const newData = decodeString(data, path, from, to, prefix, suffix);
    return feed.send(newData);
}
