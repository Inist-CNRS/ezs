import hasher from 'node-object-hash';
import get from 'lodash.get';
import set from 'lodash.set';
import Store from './store';

/**
 * Take `Object` object and getting the value field
 *
 * ```json
 * [
 *  { a: 1, },
 *  { a: 1, },
 *  { a: 2, },
 *  { a: 3, },
 *  { a: 3, },
 *  { a: 3, },
 * ]
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
 *     "a": 1,
 *     "stats": {
 *         "a": {
 *             "sample": 2,
 *             "frequency": 1,
 *             "percentage": 25,
 *             "sum": 4,
 *             "count": 3,
 *             "min": 1,
 *             "max": 2,
 *             "mean": 1.3333333333333333,
 *             "range": 1,
 *             "midrange": 0.5,
 *             "variance": 0.2222222222222222,
 *             "deviation": 0.4714045207910317,
 *             "population": 2
 *         }
 *     }
 * },
 * {
 *     "a": 1,
 *     "stats": {
 *         "a": {
 *             "sample": 2,
 *             "frequency": 1,
 *             "percentage": 25,
 *             "sum": 4,
 *             "count": 3,
 *             "min": 1,
 *             "max": 2,
 *             "mean": 1.3333333333333333,
 *             "range": 1,
 *             "midrange": 0.5,
 *             "variance": 0.2222222222222222,
 *             "deviation": 0.4714045207910317,
 *             "population": 2
 *         }
 *      }
 * },
 * {
 *     "a": 2,
 *     "stats": {
 *         "a": {
 *             "sample": 1,
 *             "frequency": 0.5,
 *             "percentage": 50,
 *             "sum": 4,
 *             "count": 3,
 *             "min": 1,
 *             "max": 2,
 *             "mean": 1.3333333333333333,
 *             "range": 1,
 *             "midrange": 0.5,
 *             "variance": 0.2222222222222222,
 *             "deviation": 0.4714045207910317,
 *             "population": 2
 *      }
 *    }
 * }]
 * ```
 * Compute some statistics from one or more fields
 *
 * @param {String} [path=value] path of the value field
 * @param {String} [target=_statistics] path of statistics in output object
 * @returns {Object}
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
            const result = calculating(this.stack[key].stat);
            const range = result.max - result.min;
            const midrange = range / 2;
            const variance = result.diff / result.count;
            obj[key] = {
                sum: result.sum,
                count: result.count,
                min: result.min,
                max: result.max,
                mean: result.sum / result.count,
                range,
                midrange,
                variance,
                deviation: Math.sqrt(variance),
                population: Object.keys(this.stack[key].hash).length,
            };
            return obj;
        }, {});
        this.store.empty()
            .on('data', ({ value }) => {
                const localValues = value.hashValues.reduce((obj, item) => {
                    const sample = this.stack[item.key].hash[item.hashValue];
                    const percentage = (100 * this.stack[item.key].vals[item.hashValue]) / values[item.key].sum;
                    const frequency = sample / values[item.key].population;
                    obj[item.key] = {
                        sample,
                        frequency,
                        percentage,
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
            this.stack[key] = { stat: [], hash: {}, vals: {} };
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
        this.stack[key].vals[hashValue] = numValue;
        return { key, hashValue };
    }).filter(Boolean);
    const uri = 'uid:'.concat(this.getIndex().toString().padStart(10, '0'));
    this.store.put(uri, { data, hashValues }).then(() => feed.end());
}
