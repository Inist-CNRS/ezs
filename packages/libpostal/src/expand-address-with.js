import { get } from 'lodash';
import expand from './postal/expand';

/**
 * Try to normalize given addresss.
 *
 * Essayer de normaliser les adresses données.
 *
 * ### Example / Exemple
 *
 * #### Script / Scénario
 *
 * ```ini
 * ; Import libpostal plugin required to use "expandAddressWith"
 * ; Importation du plugin libpostal nécessaire pour utiliser "expandAddressWith"
 * [use]
 * plugin = libpostal
 *
 * ; Using "expandAddressWith"
 * ; Utilisation de "expandAddressWith"
 * [expandAddress]
 * ; path = value
 *
 * ```
 *
 * #### Input / Entrée
 *
 * ```json
 *  [
 *      {
 *          "value": "Barboncino 781 Franklin Ave, Crown Heights, Brooklyn, NY 11238"
 *      }
 *  ]
 * ```
 *
 * #### Output / Sortie
 *
 * ```json
 *  [
 *      {
 *          "value": {
 *              "id": "Barboncino 781 Franklin Ave, Crown Heights, Brooklyn, NY 11238",
 *              "value": [
 *                  "barboncino 781 franklin avenue crown heights brooklyn ny 11238",
 *                  "barboncino 781 franklin avenue crown heights brooklyn new york 11238"
 *              ]
 *          }
 *      }
 *  ]
 * ```
 *
 * @name expandAddressWith
 *
 * @param {{path:string[]} | {path:string[]}[] | Object} input
 *
 * @param {String} [path=value]
 * <ul><li>path of the element to expand</li></ul>
 * <ul><li>chemin de l'élément à etandre</li></ul>
 *
 * @returns {{
 *    path: {id: string, value: string[]}
 * }|{
 *    path: {id: string, value: string[]}
 * }[]|Object}
 */
const expandAddressWith = (input, path) => {
    // If the input is an array,
    // apply the expand function on each value and return the original object with the modified value
    if (Array.isArray(input)) {
        return input.map(value => {
            const dataToProcess = get(value, path);
            if (typeof dataToProcess === 'string') {
                return {
                    ...value,
                    [path]: expand(dataToProcess)
                };
            }
            return value;
        });
    }

    const dataToProcess = get(input, path);
    // If the value of the given path is a string,
    // apply the expand function on it and return the original object with the modified value
    if (typeof dataToProcess === 'string') {
        return {
            ...input,
            [path]: expand(dataToProcess)
        };
    }

    // If the value of the given path is not a string or an array, return the original object
    return input;
};

/**
 * ExpandAddressWith function see documentation at the end.
 * This part of the doc is used for jsdoc typing
 * @private
 * @param data {unknown}
 * @param feed {Feed}
 * @param ctx {import('../../core/src/engine').EngineScope}
 */
const handleEzsFeed = (data, feed, ctx) => {
    const path = []
        .concat(ctx.getParam('path', 'value'))
        .filter(Boolean)[0];

    if (ctx.isLast()) {
        return feed.close();
    }

    return feed.send(expandAddressWith(data, path));
};

export default handleEzsFeed;
