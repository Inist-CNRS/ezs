import parse from './postal/parse';

/**
 * ParseAddress function see documentation at the end.
 * This part of the doc is used for jsdoc typing
 * @private
 * @param data {unknown}
 * @param feed {Feed}
 * @param ctx {import('../../core/src/engine').EngineScope}
 */
const parseAddress = (data, feed, ctx) => {
    if (ctx.isLast()) {
        return feed.close();
    }
    if (Array.isArray(data)) {
        return feed.send(data.map(entry => parse(entry)));
    }
    if (typeof data === 'string') {
        return feed.send(parse(data));
    }
    return feed.send(data);
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
 * ; Import libpostal plugin required to use "parseAddress"
 * ; Importation du plugin libpostal nécessaire pour utiliser "parseAddress"
 * [use]
 * plugin = libpostal
 *
 * ; Using "parseAddress"
 * ; Utilisation de "parseAddress"
 * [parseAddress]
 *
 * ```
 *
 * #### Input / Entrée
 *
 * ```json
 *  [
 *      "Barboncino 781 Franklin Ave, Crown Heights, Brooklyn, NY 11238"
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
 * @name parseAddress
 *
 * @returns {{
 *     id: String,
 *     value: Array<String>
 * }}
 */
export default parseAddress;
