import get from 'lodash.get';
import core from './core';
import Store from './store';

/**
 * Take `Object` like { id, value } and throw a serie of number value
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
 * [distribute]
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
 * @name distribute
 * @param {String} [id="id"] path to use for id
 * @param {String} [value="value"] path to use for value
 * @param {String} [step=1] step between each valut
 * @param {Number} [start=min value in the stream] first value to throw
 * @param {Number} [size=(max value - min value) in the stream] size of the distribution
 * @param {Number} [default=0] default value for missing object
 * @returns {Object}
 */
export default function distribute(data, feed) {
    const id = get(data, this.getParam('id', 'id')) || this.getIndex();
    const value = get(data, this.getParam('value', 'value'));

    if (!this.store) {
        this.store = new Store(this.ezs, 'sort');
        this.max = null;
        this.min = null;
    }
    if (this.isLast()) {
        const start = Number(this.getParam('start', this.min));
        const step = Number(this.getParam('step', 1));
        const size = Number(this.getParam('size', (this.max - start)));
        const leng = Math.ceil(size / step);
        const stop = start + size;
        const defval = this.getParam('default', 0);

        const ruler = Array(leng);
        let j = 0;
        for (let i = start; i <= stop; i += step) {
            ruler[j] = i;
            j += 1;
        }
        let x = 0;
        this.store.empty()
            .on('data', (item) => {
                const key = parseInt(item.id, 10);
                const idx = ruler.indexOf(key);
                if (idx > x) {
                    for (let k = x; k < idx; k += 1) {
                        const newobj = core(ruler[k], defval);
                        feed.write(newobj);
                        x += 1;
                    }
                    feed.write(item.value);
                    x += 1;
                } else if (idx === x) {
                    feed.write(item.value);
                    x += 1;
                }
            })
            .on('end', () => {
                for (let l = x; l < ruler.length; l += 1) {
                    const newobj = core(ruler[l], defval);
                    feed.write(newobj);
                }
                feed.close();
            });
    } else {
        const idt = Number(id) || 0;
        const key = idt.toFixed(20).toString().padStart(40, '0');
        if (this.max === null) {
            this.max = idt;
        }
        if (this.min === null) {
            this.min = idt;
        }
        if (idt > this.max) {
            this.max = idt;
        }
        if (idt < this.min) {
            this.min = idt;
        }
        this.store.put(key, core(idt, value)).then(() => feed.end());
    }
}
