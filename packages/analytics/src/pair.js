import { get } from 'lodash';
import core from './core';

/**
 * Pair function see documentation at the end.
 * This part of the doc is used for jsdoc typing
 * @private
 * @param data {unknown}
 * @param feed {Feed}
 * @param ctx {import('../../core/src/engine').EngineScope}
 */
const pair = (data, feed, ctx) => {
    if (ctx.isLast()) {
        feed.close();
        return;
    }
    const idt = ctx.getParam('identifier', false);
    const weight = idt === false ? 1 : get(data, idt, 1);
    const fields = [].concat(ctx.getParam('path', []));

    const values = fields
        .map((key) => get(data, key))
        .filter((x) => x)
        .map((item) => (item instanceof Array ? item : [item]));

    values
        .forEach((v, i) => {
            const a = values.slice(i + 1).reduce((pre, cur) => pre.concat(cur), []);
            if (a.length > 0) {
                v.forEach((w) => {
                    a.forEach((x) => feed.write(core([w, x], weight)));
                });
            }
        });

    feed.end();
};

/**
 * Create a pair with 'id' containing a pair of the given 'path's and 'value' set to 1.
 *
 * Créer un couple 'id' contenent un couple des 'path's donnée et 'value' mise à 1.
 *
 * #### Script / Scénario
 *
 * ```ini
 * ; Import analytics plugin required to use "pair"
 * ; Importation du plugin analytique nécessaire pour utiliser "pair"
 * [use]
 * plugin = analytics
 *
 * ; Using "pair" with 'departure' and 'arrival' as paths setttings
 * ; Utilisation de "pair" avec 'departure' et 'arrival' comme paramètres de paths
 * [pair]
 * path = departure
 * path = arrival
 *
 * ```
 *
 * #### Input / Entrée
 *
 * ```json
 *  [
 *      { "departure": ["tokyo", "nancy"], "arrival": "toul" },
 *      { "departure": ["paris", "nancy"], "arrival": "toul" },
 *      { "departure": ["london", "berlin"], "arrival": "toul" }
 *  ]
 * ```
 *
 * #### Output / Sortie
 *
 * ```json
 *  [
 *      { "id": ["tokyo", "toul"], "value": 1 },
 *      { "id": ["nancy", "toul"], "value": 1 },
 *      { "id": ["paris", "toul"], "value": 1 },
 *      { "id": ["nancy", "toul"], "value": 1 },
 *      { "id": ["london", "toul"], "value": 1 },
 *      { "id": ["berlin", "toul"], "value": 1 }
 *  ]
 * ```
 *
 * @name pair
 * @param {String} [identifier=false] path to use to set value result field (if not set or not exists, 1 is use as a default value)
 * @param {String}
 *      <ul><li>path of the element who will be use to create the pair</li></ul>
 *      <ul><li>chemin de l'élément qui vas etre utilisé pour créer le couple</li></ul>
 * @returns {{
 *      id: Array<String>,
 *      value: 1
 * }}
 */
export default pair;
