import zipObject from 'lodash.zipobject';

/**
 * Take an object and map its keys to the one in mapping parameters.
 * Keep keys absent in `from` parameter.
 *
 * @example <caption>Input:</caption>
 * [{
 *   "dFgH": "Value",
 *   "AaAa": "Value 2"
 * }]
 *
 * @example <caption>EZS:</caption>
 * [keyMapping]
 * from = dFgH
 * to = Title
 * from = AaAa
 * to = Description
 *
 * @example <caption>Output</caption>
 * [{
 *   "Title": "Value",
 *   "Description": "Value 2"
 * }]
 *
 * @param {Array<string>}   from    keys of the input
 * @param {Array<string>}   to  matching keys for the output
 * @returns Same object with modified keys
 * @name keyMapping
 * @export
 */
export default function keyMapping(data, feed) {
    const from = this.getParam('from', []);
    const to = this.getParam('to', []);
    const froms = Array.isArray(from) ? from : [from];
    const tos = Array.isArray(to) ? to : [to];
    const mapping = zipObject(froms, tos);

    if (this.isLast()) {
        return feed.close();
    }
    const res = Object
        .keys(data)
        .reduce((o, key) => ({
            ...o,
            [mapping[key] ? mapping[key] : key]: data[key],
        }), {});
    feed.write(res);
    return feed.end();
}
