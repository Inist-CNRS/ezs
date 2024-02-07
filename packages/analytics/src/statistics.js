import hasher from 'node-object-hash';
import { get, set } from 'lodash';
import { createStore } from '@ezs/store';

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

/**
 * Statistics function see documentation at the end.
 * This part of the doc is used for jsdoc typing
 * @private
 * @param data {unknown}
 * @param feed {Feed}
 * @param ctx {import('../../core/src/engine').EngineScope}
 */
const statistics = async (data, feed, ctx) => {
    const path = ctx.getParam('path', 'value');
    const target = ctx.getParam('target', '_statistics');
    const fields = Array.isArray(path) ? path : [path];
    const keys = fields.filter((k) => typeof k === 'string');

    if (ctx.isFirst()) {
        const location = ctx.getParam('location');
        ctx.store = createStore(ctx.ezs, 'statistics', location);
        ctx.store.reset();
        ctx.stack = {};
    }
    if (ctx.isLast()) {
        const values = keys.filter((key) => ctx.stack[key]).reduce((obj, key) => {
            const result = calculating(ctx.stack[key].stat);
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
                population: Object.keys(ctx.stack[key].hash).length,
            };
            return obj;
        }, {});
        const stream = await ctx.store.empty();
        stream
            .on('data', ({ value }) => {
                const localValues = value.hashValues.reduce((obj, item) => {
                    const sample = ctx.stack[item.key].hash[item.hashValue];
                    const percentage = (100 * ctx.stack[item.key].vals[item.hashValue]) / values[item.key].sum;
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
            .on('end', async () => {
                await ctx.store.close();
                feed.close();
            });
        return;
    }
    const hashValues = keys.map((key) => {
        const rawValue = get(data, key);
        if (!rawValue) return;
        if (!ctx.stack[key]) {
            ctx.stack[key] = { stat: [], hash: {}, vals: {} };
        }
        const numValue = Number(rawValue);
        ctx.stack[key].stat.push({
            sum: numValue || 0,
            min: numValue || 0,
            max: numValue || 0,
            count: 1,
            diff: 0,
        });
        const hashValue = hashCoerce.hash(rawValue);
        if (ctx.stack[key].hash[hashValue]) {
            ctx.stack[key].hash[hashValue] += 1;
        } else {
            ctx.stack[key].hash[hashValue] = 1;
        }
        ctx.stack[key].vals[hashValue] = numValue;
        return { key, hashValue };
    }).filter(Boolean);
    const uri = 'uid:'.concat(ctx.getIndex().toString().padStart(10, '0'));
    ctx.store.put(uri, { data, hashValues }).then(() => feed.end());
};

/**
 * Analyse and create statistics from given fields.
 *
 * Analyse et crée des statistiques à partir des champs donnés.
 *
 * ### Example / Exemple
 *
 * #### Script / Scénario
 * ```ini
 * ; Import analytics plugin required to use "statistics"
 * ; Importation du plugin analytique nécessaire pour utiliser "statistics"
 * [use]
 * plugin = analytics
 *
 * ; Using "statistics" with default settings
 * ; Utilisation de "statistics" avec les paramètres par défaut
 * [statistics]
 * ; path = value
 * ; target = _statistics
 *
 * ```
 *
 * #### Input / Entrée
 * ```json
 *  [
 *      { "value": 1 },
 *      { "value": 1 },
 *      { "value": 2 },
 *      { "value": 3 },
 *      { "value": 3 },
 *      { "value": 3 }
 *  ]
 * ```
 *
 * #### Output / Sortie
 *
 * ```json
 *  [
 *      {
 *          "value": 1,
 *          "_statistics": {
 *              "value": {
 *                  "sample": 2,
 *                  "frequency": 1,
 *                  "percentage": 25,
 *                  "sum": 4,
 *                  "count": 3,
 *                  "min": 1,
 *                  "max": 2,
 *                  "mean": 1.3333333333333333,
 *                  "range": 1,
 *                  "midrange": 0.5,
 *                  "variance": 0.2222222222222222,
 *                  "deviation": 0.4714045207910317,
 *                  "population": 2
 *              }
 *          }
 *      },
 *      {
 *          "value": 1,
 *          "_statistics": {
 *              "value": {
 *                  "sample": 2,
 *                  "frequency": 1,
 *                  "percentage": 25,
 *                  "sum": 4,
 *                  "count": 3,
 *                  "min": 1,
 *                  "max": 2,
 *                  "mean": 1.3333333333333333,
 *                  "range": 1,
 *                  "midrange": 0.5,
 *                  "variance": 0.2222222222222222,
 *                  "deviation": 0.4714045207910317,
 *                  "population": 2
 *              }
 *          }
 *      },
 *      {
 *          "value": 2,
 *          "_statistics": {
 *              "value": {
 *                  "sample": 1,
 *                  "frequency": 0.5,
 *                  "percentage": 50,
 *                  "sum": 4,
 *                  "count": 3,
 *                  "min": 1,
 *                  "max": 2,
 *                  "mean": 1.3333333333333333,
 *                  "range": 1,
 *                  "midrange": 0.5,
 *                  "variance": 0.2222222222222222,
 *                  "deviation": 0.4714045207910317,
 *                  "population": 2
 *              }
 *          }
 *      }
 *  ]
 * ```
 *
 * @name statistics
 * @param {String} [path=value]
 *      <ul><li>path of the element used to create the statistics</li></ul>
 *      <ul><li>chemin de l'élément utilisé pour créer les statistiques</li></ul>
 * @param {String} [target=_statistics]
 *      <ul><li>path of the statistics in the returned object</li></ul>
 *      <ul><li>chemin des stastistiques dans l'objet retourné</li></ul>
 * @returns {Object}
 */
export default statistics;