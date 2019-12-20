import get from 'lodash.get';
import core from './core';
/**
 * Take `Object` object getting some fields with json path, and do ...
 *
 * ```json
 * [{
 *           { a: 'x', b: 'z' },
 *           { a: 't', b: 'z' },
 *           { a: 't', b: 'z' },
 *           { a: 'x', b: 'z' },
 *           { a: 'x', b: 'z' },
 * }]
 * ```
 *
 * Script:
 *
 * ```ini
 * [use]
 * plugin = analytics
 *
 * [distinct]
 * path = a
 *
 * ```
 *
 * Output:
 *
 * ```json
 * [
 *           { id: 'x', value: 1 },
 *           { id: 't', value: 1 },
 *           { id: 't', value: 1 },
 *           { id: 'x', value: 1 },
 *           { id: 'x', value: 1 },
 * ]
 * ```
 *
 * @name distinct
 * @param {String} [path="id"] path
 * @returns {Object}
 */
export default function distinct(data, feed) {
    if (this.isLast()) {
        feed.close();
        return;
    }
    const path = this.getParam('path', 'id');
    const fields = Array.isArray(path) ? path : [path];

    fields
        .filter((k) => typeof k === 'string')
        .map((key) => get(data, key))
        .filter((x) => x)
        .map((item) => (item instanceof Array ? item : [item]))
        .reduce((pre, cur) => pre.concat(cur), [])
        .forEach((item) => feed.write(core(item, 1)));
    feed.end();
}
