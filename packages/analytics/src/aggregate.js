import { get } from 'lodash';
import core from './core';

/**
 * Aggregate by id and count
 *
 * ```json
 * [{
 *          { key: 'x', value: 2 },
 *          { key: 't', value: 2 },
 *          { key: 'x', value: 3 },
 *          { key: 'x', value: 5 },
 * }]
 * ```
 *
 * Script:
 *
 * ```ini
 * [use]
 * plugin = analytics
 *
 * [aggregate]
 * id = key
 *
 * ```
 *
 * Output:
 *
 * ```json
 * [
 *          { id: 'x', value: [ 2, 3, 5] },
 *          { id: 't', value: [ 2 ]  },
 * ]
 * ```
 *
 * @name aggregate
 * @param {String} [path=id] path to use for id
 * @param {String} [value=value] path to use for value (if not found 1 is the default value)
 * @returns {Object}
 */
export default function aggregate(data, feed) {
    if (!this.store) {
        this.store = {};
    }
    if (this.isLast()) {
        for (let key in this.store) {
            feed.write(core(JSON.parse(key), this.store[key]));
        }
        feed.close();
    } else {
        const path = this.getParam('id', 'id');
        const paths = Array.isArray(path) ? path : [path];
        paths.forEach((p) => {
            const key = get(data, p);
            if (key) {
                const id = JSON.stringify(key);
                const value = get(data, this.getParam('value', 'value'), 1);
                if (this.store[id]) {
                    this.store[id].push(value);
                } else {
                    this.store[id] = [value];
                }
            }
        });
        feed.end();
    }
}
