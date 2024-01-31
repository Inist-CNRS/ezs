import get from 'lodash.get';
import core from './core';

/**
 * Pluck function see documentation at the end.
 * This part of the doc is used for jsdoc typing
 * @private
 * @param data {unknown}
 * @param feed {Feed}
 * @param ctx {import('../../core/src/engine').EngineScope}
 */
const pluck = (data, feed, ctx) => {
    if (ctx.isLast()) {
        feed.close();
        return;
    }
    let fields = ctx.getParam('path', 'id');
    if (!Array.isArray(fields)) {
        fields = [fields];
    }

    fields
        .filter((k) => typeof k === 'string')
        .map((key) => [key, get(data, key)])
        .filter((x) => x[1])
        .map((item) => ([item[0], (item[1] instanceof Array ? item[1] : [item[1]])]))
        .reduce((prev, cur) => prev.concat(cur[1].map((x) => ([cur[0], x]))), [])
        .forEach((item) => feed.write(core(item[0], item[1])));
    feed.end();
};

/**
 * Extract the value of a given `path` and create a pair with the `path` as the `id`
 * and `path` value as the `value`.
 *
 * Extrais la valeur d'un `path` donnée et créer un couple avec pour identifient le `path`
 * et comme `value` la valeur du `path`.
 *
 * ### Example / Exemple
 *
 * #### Script / Scénario
 *
 * ```ini
 * ; Import analytics plugin required to use "pluck"
 * ; Importation du plugin analytique nécessaire pour utiliser "pluck"
 * [use]
 * plugin = analytics
 *
 * ; Using "pluck" with 'year' as path setttings instead of 'id' how is the default value
 * ; Utilisation de "pluck" avec 'year' comme paramètres de path au lieux de la valeur par defaut qui et 'id'
 * [pluck]
 * path = year
 *
 * ```
 *
 * #### Input / Entrée
 *
 * ```json
 *  [
 *      { "city": "tokyo", "year": 2000, "count": 1 },
 *      { "city": "paris", "year": 2001, "count": 2 },
 *      { "city": "london", "year": 2003, "count": 3 },
 *      { "city": "nancy", "year": 2005, "count": 4 },
 *      { "city": "berlin", "year": 2007, "count": 5 },
 *      { "city": "madrid", "year": 2009, "count": 6 },
 *      { "city": "stockholm", "year": 2011, "count": 7 },
 *      { "city": "bruxelles", "year": 2013, "count": 8 }
 *  ]
 * ```
 *
 * #### Output / Sortie
 *
 * ```json
 *  [
 *      { "id": "year", "value": 2000 },
 *      { "id": "year", "value": 2001 },
 *      { "id": "year", "value": 2003 },
 *      { "id": "year", "value": 2005 },
 *      { "id": "year", "value": 2007 },
 *      { "id": "year", "value": 2009 },
 *      { "id": "year", "value": 2011 },
 *      { "id": "year", "value": 2013 }
 *  ]
 * ```
 *
 * @name pluck
 * @param {String} [path=id]
 *      <ul><li>path of the element who need to be extrated</li></ul>
 *      <ul><li>chemin de l'élément qui doit être extrais</li></ul>
 * @returns {{
 *     id: String,
 *     value: Object
 * }}
 */
export default pluck;
