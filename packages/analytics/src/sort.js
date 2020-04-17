import get from 'lodash.get';
import fastsort from 'fast-sort';
import Store from './store';
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
 *
 * ```
 *
 * Output:
 *
 * ```json
 * [
 * ]
 * ```
 *
 * @name sort
 * @param {String} [path=id] path to use for id
 * @returns {Object}
 */
export default async function sort(data, feed) {
    if (!this.store) {
        this.store = new Store(this.ezs, `sort_${Math.random()}`);
        this.table = [];
    }
    if (this.isLast()) {
        const reverse = this.getParam('reverse', false);
        const sorted = sorting(this.table, reverse);
        await sorted.reduce(async (prev, cur) => {
            const val = await this.store.get(cur);
            feed.write(val);
            return prev;
        }, Promise.resolve(true));
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
