import { get, flatten } from 'lodash';
import core from './core';

/**
 * Segment function see documentation at the end.
 * This part of the doc is used for jsdoc typing
 * @private
 * @param data {unknown}
 * @param feed {Feed}
 * @param ctx {import('../../core/src/engine').EngineScope}
 */
const segment = (data, feed, ctx) => {
    if (ctx.isLast()) {
        feed.close();
        return;
    }
    const aggr = ctx.getParam('aggregate', true);
    const idt = ctx.getParam('identifier', false);
    const path = ctx.getParam('path', 'value');
    const fields = Array.isArray(path) ? path : [path];

    const valuesOrig = fields
        .filter((k) => typeof k === 'string')
        .map((key) => get(data, key))
        .filter((x) => x)
        .map((item) => (Array.isArray(item) ? item : [item]));

    const values = valuesOrig[0] && Array.isArray(valuesOrig[0][0]) ? flatten(valuesOrig) : valuesOrig;
    const weight = idt === false ? 1 : get(data, idt, 1);

    if (aggr) {
        values.reduce((pre, cur) => pre.concat(cur), [])
            .reduce((pre, cur) => {
                if (pre) {
                    feed.write(core([pre, cur], weight));
                }
                return cur;
            }, false);
    } else {
        values.map((item) => item.reduce((pre, cur) => {
            if (pre) {
                feed.write(core([pre, cur], weight));
            }
            return cur;
        }, false));
    }

    feed.end();
};

/**
 * Returns an object containing a segmentation of the input.
 * - `[a,b,c]` will be returned as `[a,b], [b,c]`
 *
 * Renvoie un objet contenant une segmentation de l'entrée.
 * - `[a,b,c]` sera retourné sous la forme `[a,b], [b,c]`
 *
 * ### Example / Exemple
 *
 * #### Script / Scénario
 *
 * ```ini
 * ; Import analytics plugin required to use "segment"
 * ; Importation du plugin analytique nécessaire pour utiliser "segment"
 * [use]
 * plugin = analytics
 *
 * ; Using "segment" with default settings
 * ; Utilisation de "segment" avec les paramètres par défaut
 * [segment]
 * ; aggregate = true
 * ; identifier = false
 * ; path = value
 *
 * ```
 *
 * #### Input / Entrée
 *
 * ```json
 *  [
 *      {
 *          "id": "doc#1",
 *          "value": [
 *              1,
 *              2,
 *              3,
 *              4
 *          ]
 *      },
 *      {
 *          "id": "doc#2",
 *          "value": [
 *              4,
 *              5,
 *              6
 *          ]
 *      },
 *      {
 *          "id": "doc#3",
 *          "value": [
 *              6,
 *              7
 *          ]
 *      },
 *      {
 *          "id": "doc#4",
 *          "value": [
 *              1,
 *              2,
 *              3,
 *              4,
 *              5,
 *              6,
 *              7
 *          ]
 *      }
 *  ]
 * ```
 *
 * #### Output / Sortie
 *
 * ```json
 *  [
 *      { "id": [ 1, 2 ], "value": 1 },
 *      { "id": [ 2, 3 ], "value": 1 },
 *      { "id": [ 3, 4 ], "value": 1 },
 *      { "id": [ 4, 5 ], "value": 1 },
 *      { "id": [ 5, 6 ], "value": 1 },
 *      { "id": [ 6, 7 ], "value": 1 },
 *      { "id": [ 1, 2 ], "value": 1 },
 *      { "id": [ 2, 3 ], "value": 1 },
 *      { "id": [ 3, 4 ], "value": 1 },
 *      { "id": [ 4, 5 ], "value": 1 },
 *      { "id": [ 5, 6 ], "value": 1 },
 *      { "id": [ 6, 7 ], "value": 1 }
 *  ]
 * ```
 *
 * @name segment
 * @param {String} [path=value]
 *      <ul><li>path of the element who need to be segmented</li></ul>
 *      <ul><li>chemin de l'élément qui doit être segmentés</li></ul>
 * @param {Boolean} [aggregate=true] aggregate all values for all paths (or not)
 *      <ul><li>aggregate all segmented value in one element (work if you have multiple path)</li></ul>
 *      <ul><li>agréger toutes les valeurs segmentées en un seul élément (fonctionne si vous avez plusieurs chemins)</li></ul>
 * @param {String} [identifier=false]
 *      <ul><li>path of the element who will be put in value field (if not set, fallback to `1`)</li></ul>
 *      <ul><li>chemin de l'élément qui sera mis dans le champ valeur (si non défini, fallback à `1`)</li></ul>
 * @returns {{
 *     id: Array<Number>,
 *     value: Object,
 * }}
 */
export default segment;
