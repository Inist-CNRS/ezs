import get from 'lodash.get';
import core from './core';

/**
 * Aggregate by id and count
 *
 * ```json
 * [{
 *          { id: 'x', value: 2 },
 *          { id: 't', value: 2 },
 *          { id: 'x', value: 3 },
 *          { id: 'x', value: 5 },
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
 * path = id
 *
 * ```
 *
 * Output:
 *
 * ```json
 * [
 *          { id: 'x', value: 3 },
 *          { id: 't', value: 1  },
 * ]
 * ```
 *
 * @name aggregate
 * @param {String} [path=id] path to use for id
 * @returns {Object}
 */
export default function aggregate(data, feed) {
    if (!this.store) {
        this.store = {};
    }
    if (this.isLast()) {
        for (let key in this.store) {
            const item = core(key, this.store[key]);
            feed.write(item);
        }
        feed.close();
    } else {
        const path = this.getParam('path', 'id');
        const paths = Array.isArray(path) ? path : [path];
        paths.forEach((p) => {
            const id = get(data, p);
            if (this.store[id]) {
                this.store[id] += 1;
            } else {
                this.store[id] = 1;
            }
        });
        feed.end();
    }
}
