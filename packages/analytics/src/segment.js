import get from 'lodash.get';
import core from './core';
/**
 * Take `Object` object getting some fields with json path, and 
 * throw segment of value. Ex: get [a,b,c] and throw [a,b], [b,c]
 *
 * @param {String} [path=value] path
 * @returns {Object}
 */
export default function segment(data, feed) {
    if (this.isLast()) {
        feed.close();
        return;
    }
    const path = this.getParam('path', 'value');
    const fields = Array.isArray(path) ? path : [path];

    fields
        .filter(k => typeof k === 'string')
        .map(key => get(data, key))
        .filter(x => x)
        .map(item => (item instanceof Array ? item : [item]))
        .reduce((pre, cur) => pre.concat(cur), [])
        .reduce((pre, cur) => {
            if (pre) {
                feed.write(core([pre, cur], 1))
            }
            return cur;
        });
    feed.end();
}
