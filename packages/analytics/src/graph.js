import get from 'lodash.get';
import core from './core';

/**
 * Take `Object` object getting some fields with json path, and do ...
 *
 * @param {String} path
 * @returns {Object}
 */
export default function graph(data, feed) {
    if (this.isLast()) {
        feed.close();
        return;
    }
    let fields = this.getParam('path', []);
    if (!Array.isArray(fields)) {
        fields = [fields];
    }

    const values = fields
        .map(key => get(data, key))
        .filter(x => x)
        .map(item => (item instanceof Array ? item : [item]))
        .reduce((pre, cur) => pre.concat(cur), [])
        .sort();

    values.forEach(
        (v, i) => values
        .slice(i + 1)
        .forEach(w => feed.write(core(JSON.stringify([v, w]), 1))),
    );
    feed.end();
}
