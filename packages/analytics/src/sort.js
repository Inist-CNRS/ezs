import get from 'lodash.get';
import fastsort from 'fast-sort';
import { createStore } from '@ezs/store';
import { normalize } from './tune';


const sorting = (arr, reverse = false) => {
    if (!reverse) {
        return fastsort(arr).asc();
    }
    return fastsort(arr).desc();
};
/**
 * Take all `Object` and sort them with dedicated key
 *
 * ```json
 * [{
 *  { id: 2000, value: 1 },
 *  { id: 2001, value: 2 },
 *  { id: 2003, value: 3 },
 *  { id: 2005, value: 4 },
 *  { id: 2007, value: 5 },
 *  { id: 2009, value: 6 },
 *  { id: 2011, value: 7 },
 *  { id: 2013, value: 8 },
 * }]
 * ```
 *
 * Script:
 *
 * ```ini
 * [use]
 * plugin = analytics
 *
 * [sort]
 * path = value
 * reverse = true
 *
 * ```
 *
 * Output:
 *
 * ```json
 * [
 * { "id": 2013, "value": 8 },
 * { "id": 2011, "value": 7 },
 * { "id": 2009, "value": 6 },
 * { "id": 2007, "value": 5 },
 * { "id": 2005, "value": 4 },
 * { "id": 2003, "value": 3 },
 * { "id": 2001, "value": 2 },
 * { "id": 2000, "value": 1 }
 * ]
 * ```
 *
 * @name sort
 * @param {String} [path=id] path to use for id
 * @param {boolean} [reverse=false] reverser order
 * @returns {Object}
 */
export default async function sort(data, feed) {
    if (!this.store) {
        const location = this.getParam('location');
        this.store = createStore(this.ezs, 'sort', location);
        this.table = [];
    }
    if (this.isLast()) {
        const reverse = this.getParam('reverse', false);
        const sorted = sorting(this.table, reverse);
        await sorted.reduce(
            async (previousPromise, cur) => {
                await previousPromise;
                return this.store.cut(cur).then((val) => feed.write(val));
            },
            Promise.resolve(),
        );
        this.store.close();
        feed.close();
    } else {
        const path = this.getParam('path', 'id');
        const fields = Array.isArray(path) ? path : [path];
        const keys = fields
            .filter((k) => typeof k === 'string')
            .map((key) => get(data, key));
        const key = keys.length > 1 ? keys.join(',') : keys[0];
        const idx = this.getIndex().toString().padStart(20, '0');
        const hash = normalize(key).concat('~').concat(idx).replace(/\s/g, '~');
        this.table.push(hash);
        this.store.put(hash, data).then(() => feed.end());
    }
}
