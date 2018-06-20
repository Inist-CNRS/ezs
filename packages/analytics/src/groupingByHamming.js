import get from 'lodash.get';
import uniq from 'lodash.uniq';
import core from './core';

function hammingDistance(x, y) {
    const len = Math.min(x.length, y.length);
    const a = x.slice(0, len - 1);
    const b = y.slice(0, len - 1);

    let distance = 0;

    for (let i = 0; i < a.length; i += 1) {
        if (a[i] !== b[i]) {
            distance += 1;
        }
    }

    return distance;
}

const equalTo = (id, distance) => item => item.id.some(key => hammingDistance(key, id) <= distance);

/**
 * Take `Object` like { _id, value } and reduce all value with
 * ID which have the same Hamming distance in single object

 * @name groupingByHamming
 * @param {String} [id=id] path to use for id
 * @param {String} [value=value] path to use for value
 * @returns {Object}
 */
export default function groupingByHamming(data, feed) {
    if (!this.stats) {
        this.stats = [];
    }
    if (this.isLast()) {
        this.stats.forEach(key => feed.write(core(key.id, key.value)));
        feed.close();
        return;
    }
    const distance = Number(this.getParam('distance', 1)) || 1;
    const id = get(data, this.getParam('id', 'id'));
    const value = get(data, this.getParam('value', 'value'));
    const finder = equalTo(id, distance);
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
