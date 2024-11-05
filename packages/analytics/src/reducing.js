import { get } from 'lodash';
import { createStore } from '@ezs/store';

/**
 * Reducing function see documentation at the end.
 * This part of the doc is used for jsdoc typing
 * @private
 * @param data {unknown}
 * @param feed {Feed}
 * @param ctx {import('../../core/src/engine').EngineScope}
 */
const reducing = async (data, feed, ctx) => {
    if (!ctx.store) {
        const location = ctx.getParam('location');
        ctx.store = createStore(ctx.ezs, 'reducing', location);
    }
    if (ctx.isLast()) {
        const stream = await ctx.store.empty();
        stream
            .on('data', (item) => feed.write(item))
            .on('end', async () => {
                await ctx.store.close();
                feed.close();
            });
    } else {
        const id = get(data, ctx.getParam('id', 'id')) || ctx.getIndex();
        const value = get(data, ctx.getParam('value', 'value'));
        await ctx.store.add(id, value);
        feed.end();
    }
};

/**
 * Merges the `id`, `value` pairs into a new pair, associating the identifier with the values.
 *
 * Fusionne les couple `id`, `value`, en un nouveau couple associent l'identifient au valeurs.
 *
 * ### Example / Exemple
 *
 * #### Script / Scénario
 *
 * ```ini
 * ; Import analytics plugin required to use "reducing"
 * ; Importation du plugin analytique nécessaire pour utiliser "reducing"
 * [use]
 * plugin = analytics
 *
 * ; Using "reducing" with default settings
 * ; Utilisation de "reducing" avec les paramètres par défaut
 * [reducing]
 * ; id = id
 * ; value = value
 *
 * ```
 *
 * #### Input / Entrée
 *
 * ```json
 *  [
 *      { "id": "x", "value": 2 },
 *      { "id": "t", "value": 2 },
 *      { "id": "x", "value": 3 },
 *      { "id": "x", "value": 5 }
 *  ]
 * ```
 * #### Output / Sortie
 *
 * ```json
 *  [
 *      { "id": "x", "value": [2, 3, 5] },
 *      { "id": "t", "value": [2] }
 *  ]
 * ```
 *
 * @name reducing
 * @param {String} [id=id]
 * <ul><li>path of the element who will be use as the key</li></ul>
 * <ul><li>chemin de l'élément qui vas être utilisé comme clé</li></ul>
 * @param {String} [value=value]
 * <ul><li>path of the element who will be merge into an array</li></ul>
 * <ul><li>chemin de l'élément qui vas être fussioné en un tableau</li></ul>
 * @returns {{
 *     id: String,
 *     value: Array<Object>
 * }}
 */
export default reducing;
