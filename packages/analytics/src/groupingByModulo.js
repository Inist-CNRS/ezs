import get from 'lodash.get';
import uniq from 'lodash.uniq';
import core from './core';

const mod = (x, m) => x - (x % m);
const equalTo = (id) => (item) => item.id.some((key) => key === id);


/**
 * Take `Object` like `{ id, value }` and reduce all `value`s with the same
 * modulo computation in a ansingle object
 *
 * @name groupingByModulo
 * @param {String} [id=id] path to use for id
 * @param {String} [value=value] path to use for value
 * @returns {Object}
 */
export default function groupingByModulo(data, feed) {
    if (!this.stats) {
        this.stats = [];
    }
    if (this.isLast()) {
        this.stats.forEach((key) => feed.write(core(key.id, key.value)));
        feed.close();
        return;
    }
    const idt = Number(get(data, this.getParam('id', 'id'))) || this.getIndex();
    const value = get(data, this.getParam('value', 'value'));
    const modulo = Number(this.getParam('modulo', 10)) || 10;
    const id = mod(idt, modulo);
    const finder = equalTo(id);
    if (id && value) {
        const idx = this.stats.findIndex(finder);
        if (idx === -1) {
            this.stats.push(core([id], [value]));
        } else {
            this.stats[idx].id.push(id);
            this.stats[idx].id = uniq(this.stats[idx].id);
            this.stats[idx].value.push(value);
        }
    }

    feed.end();
}
