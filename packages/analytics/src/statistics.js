import hasher from 'node-object-hash';
import get from 'lodash.get';
import set from 'lodash.set';
import Store from './store';

/**
 * Take `Object` object and getting the value field
 *
 * ```json
 * [{
 *   a: 1,
 * },
 * {
 *   a: 2,
 * },
 * {
 *   a: 3,
 * }]
 * ```
 *
 * Script:
 *
 * ```ini
 * [use]
 * plugin = analytics
 *
 * [statistics]
 * path = a
 *
 * ```
 *
 * Output:
 *
 * ```json
 * [{
 *
 * }]
 * ```
 * Compute some statistics from  fields
 *
 * @param {String} [path=value] path of the value field
 * @param {String} [target=_statistics] path of statistics in output object
 * * @returns {Object}
 */
const hashCoerce = hasher({
    sort: false,
    coerce: true,
});

// https://gist.github.com/RedBeard0531/1886960
const calculating = (values) => {
    const a = values[0]; // will reduce into here
    for (let i = 1/*!*/; i < values.length; i += 1) {
        const b = values[i]; // will merge 'b' into 'a'

        // temp helpers
        const delta = a.sum / a.count - b.sum / b.count; // a.mean - b.mean
        const weight = (a.count * b.count) / (a.count + b.count);

        // do the reducing
        a.diff += b.diff + delta * delta * weight;
        a.sum += b.sum;
        a.count += b.count;
        a.min = Math.min(a.min, b.min);
        a.max = Math.max(a.max, b.max);
    }

    return a;
};


export default function statistics(data, feed) {
    const path = this.getParam('path', 'value');
    const target = this.getParam('target', '_statistics');
    const fields = Array.isArray(path) ? path : [path];
    const keys = fields.filter((k) => typeof k === 'string');

    if (this.isFirst()) {
        this.store = new Store(this.ezs, 'statistics'.concat(Date.now()));
        this.store.reset();
        this.stack = {};
    }
    if (this.isLast()) {
        const values = keys.filter((key) => this.stack[key]).reduce((obj, key) => {
            const value = calculating(this.stack[key].stat);
            value.mean = value.sum / value.count;
            value.range = value.max - value.min;
            value.midrange = value.range / 2;
            value.variance = value.diff / value.count;
            value.deviation = Math.sqrt(value.variance);
            value.population = Object.keys(this.stack[key].hash).length;
            delete value.diff;
            obj[key] = value;
            return obj;
        }, {});
        this.store.empty()
            .on('data', ({ value }) => {
                const localValues = value.hashValues.reduce((obj, item) => {
                    const sample = this.stack[item.key].hash[item.hashValue];
                    const frequency = sample / values[item.key].population;
                    obj[item.key] = {
                        sample,
                        frequency,
                        ...values[item.key],
                    };
                    return obj;
                }, { });
                set(value.data, target, localValues);
                feed.write(value.data);
            })
            .on('end', () => {
                feed.close();
            });
        return;
    }
    const hashValues = keys.map((key) => {
        const rawValue = get(data, key);
        if (!rawValue) return;
        if (!this.stack[key]) {
            this.stack[key] = { stat: [], hash: {} };
        }
        const numValue = Number(rawValue);
        this.stack[key].stat.push({
            sum: numValue || 0,
            min: numValue || 0,
            max: numValue || 0,
            count: 1,
            diff: 0,
        });
        const hashValue = hashCoerce.hash(rawValue);
        if (this.stack[key].hash[hashValue]) {
            this.stack[key].hash[hashValue] += 1;
        } else {
            this.stack[key].hash[hashValue] = 1;
        }
        return { key, hashValue };
    }).filter(Boolean);
    const uri = 'uid:'.concat(this.getIndex().toString().padStart(10, '0'));
    this.store.put(uri, { data, hashValues }).then(() => feed.end());
}
