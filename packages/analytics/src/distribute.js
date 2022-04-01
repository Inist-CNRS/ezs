import get from 'lodash.get';
import core from './core';
import { createStore } from '@ezs/store';

/**
 * Take `Object` like { id, value } and throw a serie of number value
 *
 * ```json
 * [
 *           { id: 2000, value: 1 },
 *           { id: 2001, value: 2 },
 *           { id: 2003, value: 3 },
 *           { id: 2005, value: 4 },
 *           { id: 2007, value: 5 },
 *           { id: 2009, value: 6 },
 *           { id: 2011, value: 7 },
 *           { id: 2013, value: 8 },
 * ]
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
 *       { "id": 2000, "value": 1 },
 *      { "id": 2001, "value": 2 },
 *      { "id": 2002, "value": 0 },
 *      { "id": 2003, "value": 3 },
 *      { "id": 2004, "value": 0 },
 *      { "id": 2005, "value": 4 },
 *      { "id": 2006, "value": 0 },
 *      { "id": 2007, "value": 5 },
 *      { "id": 2008, "value": 0 },
 *      { "id": 2009, "value": 6 },
 *      { "id": 2010, "value": 0 },
 *      { "id": 2011, "value": 7 },
 *      { "id": 2012, "value": 0 },
 *      { "id": 2013, "value": 8 }
 * ]
 * ```
 *
 * @name distribute
 * @param {String} [id="id"] path to use for id
 * @param {String} [value="value"] path to use for value
 * @param {String} [step=1] step between each value
 * @param {Number} [start=min value in the stream] first value to throw
 * @param {Number} [size=(max value - min value) in the stream] size of the distribution
 * @param {Number} [default=0] default value for missing object
 * @returns {Object}
 */
export default async function distribute(data, feed) {
    const id = get(data, this.getParam('id', 'id')) || this.getIndex();
    const value = get(data, this.getParam('value', 'value'));

    if (!this.store) {
        const location = this.getParam('location');
        this.store = createStore(this.ezs, 'sort', location);
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
        const stream = await this.store.empty();
        stream
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
                this.store.close();
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
