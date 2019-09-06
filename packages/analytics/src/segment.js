import get from 'lodash.get';
import flatten from 'lodash.flatten';
import core from './core';
/**
 * Take `Object` object getting some fields with json path, and
 * throw segment of value. Ex: get [a,b,c] and throw [a,b], [b,c]
 *
 * @param {String} [path=value] path
 * @param {Boolean} [aggregate=true] aggregate all values for all paths (or not)
 * @returns {Object}
 */
export default function segment(data, feed) {
    if (this.isLast()) {
        feed.close();
        return;
    }
    const aggr = this.getParam('aggregate', true);
    const path = this.getParam('path', 'value');
    const fields = Array.isArray(path) ? path : [path];

    const valuesOrig = fields
        .filter((k) => typeof k === 'string')
        .map((key) => get(data, key))
        .filter((x) => x)
        .map((item) => (Array.isArray(item) ? item : [item]));

    const values = valuesOrig[0] && Array.isArray(valuesOrig[0][0]) ? flatten(valuesOrig) : valuesOrig;

    if (aggr) {
        values.reduce((pre, cur) => pre.concat(cur), [])
            .reduce((pre, cur) => {
                if (pre) {
                    feed.write(core([pre, cur], 1));
                }
                return cur;
            }, false);
    } else {
        values.map((item) => item.reduce((pre, cur) => {
            if (pre) {
                feed.write(core([pre, cur], 1));
            }
            return cur;
        }, false));
    }

    feed.end();
}
