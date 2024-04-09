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
 *          "id": "Barboncino 781 Franklin Ave, Crown Heights, Brooklyn, NY 11238",
 *          "value": [
 *              "barboncino 781 franklin avenue crown heights brooklyn ny 11238",
 *              "barboncino 781 franklin avenue crown heights brooklyn new york 11238"
 *          ]
 *      }
 *  ]
 * ```
 *
 * @name expandAddressWith
 *
 * @returns {{
 *    id: string,
 *    [path: string]: string[]
 * }}
 */

/**
 * Perform the normalization on the data and return the result
 * @private
 * @param data {unknown}
 * @param path {string}
 */
const expandAddressWith = (data, path) => {
    /** @type {unknown} */
    const dataToProcess = get(data, path);

    if (Array.isArray(dataToProcess)) {
        return dataToProcess.map(value => expandAddressWith(value, path));
    }

    if (typeof dataToProcess === 'string') {
        return expand(dataToProcess, path);
    }

    return dataToProcess;
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
    const paths = []
        .concat(ctx.getParam('path'))
        .filter(Boolean);

    if (ctx.isLast()) {
        return feed.close();
    }

    paths.forEach((path) => {
        feed.send(expandAddressWith(data, path));
    });

    return feed.end();
};

export default handleEzsFeed;
