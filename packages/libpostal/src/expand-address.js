import expand from './postal/expand';

/**
 * ExpandAddress function see documentation at the end.
 * This part of the doc is used for jsdoc typing
 * @private
 * @param data {unknown}
 * @param feed {Feed}
 * @param ctx {import('../../core/src/engine').EngineScope}
 */
const expandAddress = (data, feed, ctx) => {
    if (ctx.isLast()) {
        return feed.close();
    }
    if (Array.isArray(data)) {
        return feed.send(data.map(entry => expand(entry)));
    }
    if (typeof data === 'string') {
        return feed.send(expand(data));
    }
    return feed.send(data);
};


/**
 * Try to normalized given addresss.
 *
 * Essayer de normaliser les adresses données.
 *
 * ### Example / Exemple
 *
 * #### Script / Scénario
 *
 * ```ini
 * ; Import libpostal plugin required to use "expandAddress"
 * ; Importation du plugin libpostal nécessaire pour utiliser "expandAddress"
 * [use]
 * plugin = libpostal
 *
 * ; Using "expandAddress"
 * ; Utilisation de "expandAddress"
 * [expandAddress]
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
 * @name expandAddress
 *
 * @returns {{
 *     id: String,
 *     value: Array<String>
 * }}
 */
export default expandAddress;
