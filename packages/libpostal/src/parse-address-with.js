import { get } from 'lodash';
import parse from './postal/parse';

/**
 * ParseAddressWith function see documentation at the end.
 * This part of the doc is used for jsdoc typing
 * @private
 * @param data {unknown}
 * @param feed {Feed}
 * @param ctx {import('../../core/src/engine').EngineScope}
 */
const parseAddressWith = (data, feed, ctx) => {
    const paths = []
        .concat(ctx.getParam('path'))
        .filter(Boolean);
    if (ctx.isLast()) {
        return feed.close();
    }

    paths.forEach((path) => {
        const value = get(data, path);
        if (Array.isArray(value)) {
            return feed.send(value.map(entry => parse(entry, path)));
        }
        if (typeof value === 'string') {
            return feed.send(parse(value, path));
        }
        return feed.send(value);
    });
    return feed.end();
};

/**
 * Try to parse given addresss.
 *
 * Essayer de faire l'analyse grammaticale des adresses données.
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
 *          "id": "Barboncino 781 Franklin Ave, Crown Heights, Brooklyn, NY 11238",
 *          "value": {
 *              "house": "barboncino",
 *              "house_number": "781",
 *              "road": "franklin ave",
 *              "suburb": "crown heights",
 *              "city_district": "brooklyn",
 *              "state": "ny",
 *              "postcode": "11238"
 *          }
 *      }
 *  ]
 * ```
 *
 * @name parseAddressWith
 *
 * @returns {{
 *    id: string,
 *    [path: string]: string[]
 * }}
 */
export default parseAddressWith;
