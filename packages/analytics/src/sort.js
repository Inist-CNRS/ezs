import get from 'lodash.get';
import fastsort from 'fast-sort';
import { createStore } from '@ezs/store';
import { normalize } from './tune';


const sorting = (arr, reverse = false) => {
    if (!reverse) {
        return fastsort(arr).asc();
    }
    return fastsort(arr).desc();
};

/**
 * Sort function see documentation at the end.
 * This part of the doc is use for jsdoc typing
 * @private
 * @param data {unknown}
 * @param feed {Feed}
 * @param ctx {import('../../core/src/engine').EngineScope}
 */
const sort = async (data, feed, ctx) => {
    if (!ctx.store) {
        const location = ctx.getParam('location');
        ctx.store = createStore(ctx.ezs, 'sort', location);
        ctx.table = [];
    }
    if (ctx.isLast()) {
        const reverse = ctx.getParam('reverse', false);
        const sorted = sorting(ctx.table, reverse);
        await sorted.reduce(
            async (previousPromise, cur) => {
                await previousPromise;
                return ctx.store.cut(cur)
                    .then((val) => feed.write(val));
            },
            Promise.resolve(),
        );
        await ctx.store.close();
        feed.close();
    } else {
        const path = ctx.getParam('path', 'id');
        const fields = Array.isArray(path) ? path : [path];
        const keys = fields
            .filter((k) => typeof k === 'string')
            .map((key) => get(data, key));
        const key = keys.length > 1 ? keys.join(',') : keys[0];
        const idx = ctx.getIndex()
            .toString()
            .padStart(20, '0');
        const hash = normalize(key)
            .concat('~')
            .concat(idx)
            .replace(/\s/g, '~');
        ctx.table.push(hash);
        await ctx.store.put(hash, data);
        feed.end();
    }
};

/**
 * Sort incomming object base on the value of the given path.
 *
 * Trier les objets entrants sur la base de la valeur du chemin donné.
 *
 * ### Example / Exemple
 *
 * #### Script / Scénario
 *
 * ```ini
 * ; Import analytics plugin required to use sort
 * ; Importation du plugin analytique nécessaire pour utiliser sort
 * [use]
 * plugin = analytics
 *
 * ; Using "sort" with default settings
 * ; Utilisation de "sort" avec les paramètres par défaut
 * [sort]
 * ; path = id
 * ; reverse = false
 *
 * ```
 *
 * #### Input / Entrée
 *
 * ```json
 *  [
 *      { "id": 2013, "value": 8 },
 *      { "id": 2011, "value": 7 },
 *      { "id": 2009, "value": 6 },
 *      { "id": 2007, "value": 5 },
 *      { "id": 2005, "value": 4 },
 *      { "id": 2003, "value": 3 },
 *      { "id": 2001, "value": 2 },
 *      { "id": 2000, "value": 1 }
 *  ]
 * ```
 *
 * #### Output / Sortie
 *
 * ```json
 *  [
 *      { "id": 2000, "value": 1 },
 *      { "id": 2001, "value": 2 },
 *      { "id": 2003, "value": 3 },
 *      { "id": 2005, "value": 4 },
 *      { "id": 2007, "value": 5 },
 *      { "id": 2009, "value": 6 },
 *      { "id": 2011, "value": 7 },
 *      { "id": 2013, "value": 8 }
 *  ]
 * ```
 *
 * @name sort
 * @param {String} [path=id]
 *      <ul><li>path of the element used to as reference for the sort</li></ul>
 *      <ul><li>chemin de l'élément utilisé comme reference pour le trie</li></ul>
 * @param {boolean} [reverse=false]
 *      <ul><li>sort in ascending or descending order</li></ul>
 *      <ul><li>trier par ordre croissant ou décroissant</li></ul>
 * @returns {Object}
 */
export default sort;
