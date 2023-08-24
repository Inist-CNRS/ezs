import get from 'lodash.get';
import flatten from 'lodash.flatten';
import core from './core';

/**
 * Take `Object` object getting some fields with json path, and throw segment of
 * value. Ex: get `[a,b,c]` and throw `[a,b], [b,c]`
 *
 * ```json
 * [{
 *           {
 *               id: 'doc#1',
 *               value: [
 *                    1,
 *                    2,
 *                   3,
 *                    4,
 *                ],
 *           },
 *           {
 *               id: 'doc#2',
 *               value: [
 *                   4,
 *                   5,
 *                   6,
 *               ],
 *           },
 *           {
 *               id: 'doc#3',
 *               value: [
 *                   6,
 *                   7,
 *               ]
 *           },
 *           {
 *               id: 'doc#4',
 *               value: [
 *                   1,
 *                   2,
 *                   3,
 *                   4,
 *                   5,
 *                   6,
 *                   7,
 *               ]
 *           }
 * }]
 * ```
 *
 * Script:
 *
 * ```ini
 * [use]
 * plugin = analytics
 *
 * [segment]
 * path = value
 *
 * ```
 *
 * Output:
 *
 * ```json
 * [
 *   { id: [ 1, 2 ], value: 1 }
 *   { id: [ 2, 3 ], value: 1 }
 *   { id: [ 3, 4 ], value: 1 }
 *   { id: [ 4, 5 ], value: 1 }
 *   { id: [ 5, 6 ], value: 1 }
 *   { id: [ 6, 7 ], value: 1 }
 *   { id: [ 1, 2 ], value: 1 }
 *   { id: [ 2, 3 ], value: 1 }
 *   { id: [ 3, 4 ], value: 1 }
 *   { id: [ 4, 5 ], value: 1 }
 *   { id: [ 5, 6 ], value: 1 }
 *   { id: [ 6, 7 ], value: 1 }
 * ]
 * ```
 *
 * @name segment
 * @param {String} [path=value] path
 * @param {Boolean} [aggregate=true] aggregate all values for all paths (or not)
 * @param {Boolean} [identifier=false] path to use to set value result field (if not set or not exists, 1 is use as a default value)
 * @returns {Object}
 */
export default function segment(data, feed) {
    if (this.isLast()) {
        feed.close();
        return;
    }
    const aggr = this.getParam('aggregate', true);
    const idt = this.getParam('identifier', false);
    const path = this.getParam('path', 'value');
    const fields = Array.isArray(path) ? path : [path];

    const valuesOrig = fields
        .filter((k) => typeof k === 'string')
        .map((key) => get(data, key))
        .filter((x) => x)
        .map((item) => (Array.isArray(item) ? item : [item]));

    const values = valuesOrig[0] && Array.isArray(valuesOrig[0][0]) ? flatten(valuesOrig) : valuesOrig;
    const weight = idt === false ? 1 : get(data, idt, 1);

    if (aggr) {
        values.reduce((pre, cur) => pre.concat(cur), [])
            .reduce((pre, cur) => {
                if (pre) {
                    feed.write(core([pre, cur], weight));
                }
                return cur;
            }, false);
    } else {
        values.map((item) => item.reduce((pre, cur) => {
            if (pre) {
                feed.write(core([pre, cur], weight));
            }
            return cur;
        }, false));
    }

    feed.end();
}
