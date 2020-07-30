import get from 'lodash.get';
import { createStore } from '@ezs/store';

/**
 * Take `Object` group value of `{ id, value }` objectpath
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
 * [reducing]
 *
 * ```
 *
 * Output:
 *
 * ```json
 * [
 *          { id: 'x', value: [2, 3, 5] },
 *          { id: 't', value: [2] },
 * ]
 * ```
 *
 * @name reducing
 * @param {String} [id=id] path to use for id
 * @param {String} [value=value] path to use for value
 * @returns {Object}
 */
export default function reducing(data, feed) {
    if (!this.store) {
        const location = this.getParam('location');
        this.store = createStore(this.ezs, 'reducing', location);
    }
    if (this.isLast()) {
        this.store.empty()
            .on('data', (item) => feed.write(item))
            .on('end', () => feed.close());
    } else {
        const id = get(data, this.getParam('id', 'id')) || this.getIndex();
        const value = get(data, this.getParam('value', 'value'));
        this.store.add(id, value).then(() => feed.end());
    }
}
