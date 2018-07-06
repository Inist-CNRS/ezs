import get from 'lodash.get';
import core from './core';
/**
 * Take `Object` object getting value of fields (with json path)
 * and throws a object of each value
 *
 * @param {String} [path=id] path to use form group by
 * @returns {Object}
 */
export default function pluck(data, feed) {
    if (this.isLast()) {
        feed.close();
        return;
    }
    let fields = this.getParam('path', 'id');
    if (!Array.isArray(fields)) {
        fields = [fields];
    }

    fields
        .filter(k => typeof k === 'string')
        .map(key => [key, get(data, key)])
        .filter(x => x[1])
        .map(item => ([item[0], (item[1] instanceof Array ? item[1] : [item[1]])]))
        .reduce((prev, cur) => prev.concat(cur[1].map(x => ([cur[0], x]))), [])
        .forEach(item => feed.write(core(item[0], item[1])));
    feed.end();
}
