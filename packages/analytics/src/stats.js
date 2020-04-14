import get from 'lodash.get';
import set from 'lodash.set';

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
 * [stats]
 * path = a
 *
 * [replace]
 * path = stats
 * value = env('stats')
 * ```
 *
 * Output:
 *
 * ```json
 * [{
 *
 * }]
 * ```
 * Compute some stats from one field
 *
 * @param {String} [path=value] the pah of the value field
 * @returns {Object}
 */
export default function stats(data, feed) {
    const path = this.getParam('path', 'value');
    const fields = Array.isArray(path) ? path : [path];
    if (this.isLast()) {
        const value = this.stats.reduce((previous, current) => {
            const delta = previous.sum / previous.count - current.sum / current.count;
            const weight = (previous.count * current.count) / (previous.count + current.count);
            return {
                sum: previous.sum + current.sum,
                min: Math.min(previous.min, current.min),
                max: Math.max(previous.max, current.max),
                count: previous.count + current.count,
                diff: previous.diff + current.diff + delta * delta * weight,
            };
        }, {
            sum: 0,
            min: 0,
            max: 0,
            count: 1,
            diff: 0,
        });
        value.average = value.sum / value.count;
        value.populationVariance = value.diff / value.count;
        value.populationStandardDeviation = Math.sqrt(value.populationVariance);
        value.sampleVariance = value.diff / (value.count - 1);
        value.sampleStandardDeviation = Math.sqrt(value.sampleVariance);
        delete value.diff;
        const envar = this.getEnv();
        set(envar, `stats.${path}`, value);
        feed.close();
        return;
    }
    if (this.isFirst()) {
        this.stats = [];
    }
    const val = fields
        .filter((k) => typeof k === 'string')
        .map((key) => get(data, key))
        .filter((x) => x)
        .shift();
    this.stats.push({
        sum: val || 0,
        min: val || 0,
        max: val || 0,
        count: 1,
        diff: 0,
    });
    feed.send(data);
}
