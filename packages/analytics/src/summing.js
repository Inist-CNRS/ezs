import get from 'lodash.get';
import core from './core';

/**
 * Summing function see documentation at the end.
 * This part of the doc is use for jsdoc typing
 * @private
 * @param data {unknown}
 * @param feed {Feed}
 * @param ctx
 */
const summing = (data, feed, ctx) => {
    if (ctx.isLast()) {
        feed.close();
        return;
    }

    const id = get(data, ctx.getParam('id', 'id')) || ctx.getIndex();
    const value = get(data, ctx.getParam('value', 'value'));

    const values = Array.isArray(value) ? value : [value];

    if (id && value) {
        feed.write(core(id, values.reduce((sum, x) => sum + Number(x), 0)));
    }

    feed.end();
};

/**
 * Create an id, value pair from two given path and apply a sum to the value
 *
 * Créer un couple id, value à partir de chemin et applique un somme sur la valeur
 *
 * ### Example / Exemple
 *
 * #### Script / Scénario
 *
 * ```ini
 * ; Import analytics plugin required to use summing
 * ; Importation du plugin analytique nécessaire pour utiliser summing
 * [use]
 * plugin = analytics
 *
 * ; Using "summing" with default settings
 * ; Utilisation de "summing" avec les paramètres par défaut
 * [summing]
 * ; id = id
 * ; value = value
 *
 * ```
 *
 * #### Input / Entrée
 *
 * ```json
 *  [
 *      {
 *          "id": 1,
 *          "value": [1, 1, 1],
 *          "hello": "world"
 *      },
 *      {
 *          "id": 2,
 *          "value": [2, 2, 2],
 *          "hello": "world"
 *      }
 *  ]
 *  ```
 *
 * #### Output / Sortie
 *
 *  ```json
 *  [
 *      {
 *          "id": 1,
 *          "value": 3
 *      },
 *      {
 *          "id": 2,
 *          "value": 6
 *      }
 *  ]
 *  ```
 *
 * @name summing
 * @param {String} [id=id]
 *      <ul><li>path of the element used to create the new identifier</li></ul>
 *      <ul><li>chemin de l'élément utilisé pour créer le nouvel identifiant</li></ul>
 * @param {String} [value=value]
 *      <ul><li>path of the element to be summed</li></ul>
 *      <ul><li>chemin de l'élément qui doit être sommé</li></ul>
 * @returns {{
 *     id: String,
 *     value: Object
 * }}
 */
export default summing;
