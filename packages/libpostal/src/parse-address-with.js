import { get } from 'lodash';
import parse from './postal/parse';

/**
 * Try to parse given addresss.
 *
 * Essaye de faire l'analyse grammaticale des adresses données.
 *
 * ### Example / Exemple
 *
 * #### Script / Scénario
 *
 * ```ini
 * ; Import libpostal plugin required to use "parseAddressWith"
 * ; Importation du plugin libpostal nécessaire pour utiliser "parseAddressWith"
 * [use]
 * plugin = libpostal
 *
 * ; Using "parseAddressWith"
 * ; Utilisation de "parseAddressWith"
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
 *              "value": {
 *                  "house": "barboncino",
 *                  "house_number": "781",
 *                  "road": "franklin ave",
 *                  "suburb": "crown heights",
 *                  "city_district": "brooklyn",
 *                  "state": "ny",
 *                  "postcode": "11238"
 *              }
 *          }
 *      }
 *  ]
 * ```
 *
 * @name parseAddressWith
 *
 * @param {{path:string[]} | {path:string[]}[] | Object} input
 *
 * @param {String} [path=value]
 * <ul><li>path of the element to parse</li></ul>
 * <ul><li>chemin de l'élément à analyser</li></ul>
 *
 * @returns {{
 *    path: {id: string, value: Object}
 * }|{
 *    path: {id: string, value: Object}
 * }[]|Object}
 */
const parseAddressWith = (input, path) => {
    // If the input is an array,
    // apply the parse function on each value and return the original object with the modified value
    if (Array.isArray(input)) {
        return input.map(value => {
            const dataToProcess = get(value, path);
            if (typeof dataToProcess === 'string') {
                return {
                    ...value,
                    [path]: parse(dataToProcess)
                };
            }
            return value;
        });
    }

    const dataToProcess = get(input, path);
    // If the value of the given path is a string,
    // apply the parse function on it and return the original object with the modified value
    if (typeof dataToProcess === 'string') {
        return {
            ...input,
            [path]: parse(dataToProcess)
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

    return feed.send(parseAddressWith(data, path));
};

export default handleEzsFeed;
