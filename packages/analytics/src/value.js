import get from 'lodash.get';

/**
 * Value function see documentation at the end.
 * This part of the doc is used for jsdoc typing
 * @private
 * @param data {unknown}
 * @param feed {Feed}
 * @param ctx {import('../../core/src/engine').EngineScope}
 */
const value = (data, feed, ctx) => {
    if (ctx.isLast()) {
        feed.close();
        return;
    }
    const path = ctx.getParam('path', 'value');
    const fields = Array.isArray(path) ? path : [path];

    const val = fields
        .filter((k) => typeof k === 'string')
        .map((key) => get(data, key))
        .filter((x) => x !== undefined)
        .filter((x) => x !== null)[0];

    feed.send(val);
};

/**
 * Create a new object from the value of the given `path`.
 *
 * Créer un nouvel objet à partir du chemin donné dans `path`.
 *
 * ### Example / Exemple
 *
 * #### Script / Scénario
 *
 * ```ini
 * ; Import analytics plugin required to use "value"
 * ; Importation du plugin analytique nécessaire pour utiliser "value"
 * [use]
 * plugin = analytics
 *
 * ; Using "value" with default settings
 * ; Utilisation de "tune" avec les paramètres par défaut
 * [value]
 * ; path = value
 *
 * ```
 *
 * #### Input / Entrée
 *
 * ##### Dataset 1 / Jeu de données 1
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
 * ##### Dataset 2 / Jeu de données 2
 *
 * ```json
 *  [
 *      {
 *          "id": 1,
 *          "value": {
 *              "hello": "world"
 *          }
 *      },
 *      {
 *          "id": 2,
 *          "value": {
 *              "hello": "ezs"
 *          }
 *      },
 *      {
 *          "id": 3,
 *          "value": {
 *              "hello": "lodex"
 *          }
 *      }
 *  ]
 * ```
 *
 * #### Output / Sortie
 *
 * ##### Dataset 1 / Jeu de données 1
 *
 * ```json
 *  [
 *      1,
 *      2,
 *      3,
 *      4,
 *      5,
 *      6,
 *      7,
 *      8
 *  ]
 * ```
 *
 * ##### Dataset 2 / Jeu de données 2
 *
 * ```json
 *  [
 *      {
 *          "hello": "world"
 *      },
 *      {
 *          "hello": "ezs"
 *      },
 *      {
 *          "hello": "lodex"
 *      }
 *  ]
 * ```
 *
 * @name value
 * @param {String} [path=value]
 *      <ul><li>path of the element used to create the new object</li></ul>
 *      <ul><li>chemin de l'élément utilisé pour créer le nouvel objet</li></ul>
 * @returns {Object}
 */
export default value;
