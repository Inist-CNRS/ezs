import parse from './postal/parse';

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
 * [
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
 * @name parseAddress
 *
 * @returns {{
 *     id: String,
 *     value: Array<String>
 * }}
 */

/**
 * Perform the address parsing on the data and return the result
 * @private
 * @param data {unknown}
 */
const parseAddress = (data) => {
    if (Array.isArray(data)) {
        return data.map(value => parseAddress(value));
    }

    if (typeof data === 'string') {
        return parse(data);
    }

    return data;
};


/**
 * ParseAddress function see documentation at the end.
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
        parseAddress(data)
    );
};

export default handleEzsFeed;
