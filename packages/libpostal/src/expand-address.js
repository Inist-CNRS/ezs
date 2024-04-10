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
 * @param {String|String[]|Object} input
 *
 * @returns {{
 *     id: String,
 *     value: Array<String>
 * }|{
 *     id: String,
 *     value: Array<String>
 * }[]|Object}
 */
const expandAddress = (input) => {
    if (Array.isArray(input)) {
        return input.map(value => {
            if (typeof value === 'string') {
                return expand(value);
            }
            return value;
        });
    }

    if (typeof input === 'string') {
        return expand(input);
    }

    return input;
};

/**
 * ExpandAddress function see documentation at the end.
 * This part of the doc is used for jsdoc typing
 * @private
 * @param data {unknown}
 * @param feed {Feed}
 * @param ctx {import('../../core/src/engine').EngineScope}
 */
const handleEzsFeed = (data, feed, ctx) => {
    if (ctx.isLast()) {
        return feed.close();
    }

    return feed.send(
        expandAddress(data)
    );
};

export default handleEzsFeed;
