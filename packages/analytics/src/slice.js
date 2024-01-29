
/**
 * Slice function see documentation at the end.
 * This part of the doc is use for jsdoc typing
 * @private
 * @param data {unknown}
 * @param feed {Feed}
 * @param ctx {import('../../core/src/engine').EngineScope}
 */
const slice = (data, feed, ctx) => {
    if (ctx.isLast()) {
        feed.close();
        return;
    }
    const start = Number(ctx.getParam('start')) || 1;
    const size = Number(ctx.getParam('size')) || 10;
    const stop = start + size;
    const index = Number(ctx.getIndex());

    if (index >= stop) {
        feed.close();
    } else {
        if (index >= start) {
            feed.write(data);
        }
        feed.end();
    }
    [].slice();
};

/**
 * Returns a copy of a section of a stream.
 *
 * Renvoie une copie d'une section d'un flux.
 *
 * ### Example / Exemple
 *
 * #### Script / Scénario
 *
 * ```ini
 * ; Import analytics plugin required to use slice
 * ; Importation du plugin analytique nécessaire pour utiliser slice
 * [use]
 * plugin = analytics
 *
 * ; Using "slice" with default settings
 * ; Utilisation de "slice" avec les paramètres par défaut
 * [slice]
 * ; start = 1
 * ; size = 10
 *
 * ```
 *
 * #### Input / Entrée
 *
 * ```json
 *  [
 *      { "id": 2023, "value": 12 },
 *      { "id": 2021, "value": 11 },
 *      { "id": 2019, "value": 10 },
 *      { "id": 2017, "value": 9 },
 *      { "id": 2013, "value": 8 },
 *      { "id": 2011, "value": 7 },
 *      { "id": 2009, "value": 6 },
 *      { "id": 2007, "value": 5 },
 *      { "id": 2005, "value": 4 },
 *      { "id": 2003, "value": 3 },
 *      { "id": 2001, "value": 2 },
 *      { "id": 2000, "value": 1 }
 *  ]
 * ```
 *
 * #### Output / Sortie
 *
 * ```json
 *  [
 *      { "id": 2023, "value": 12 },
 *      { "id": 2021, "value": 11 },
 *      { "id": 2019, "value": 10 },
 *      { "id": 2017, "value": 9 },
 *      { "id": 2013, "value": 8 },
 *      { "id": 2011, "value": 7 },
 *      { "id": 2009, "value": 6 },
 *      { "id": 2007, "value": 5 },
 *      { "id": 2005, "value": 4 },
 *      { "id": 2003, "value": 3 }
 *  ]
 * ```
 *
 * @name slice
 * @param {Number} [start=1]
 *      <ul><li>the beginning index of the specified portion of the stream</li></ul>
 *      <ul><li>l'indice de début de la partie spécifiée du flux</li></ul>
 * @param {Number} [size=10]
 *      <ul><li>the size of the specified portion of the stream</li></ul>
 *      <ul><li>la taille de début de la partie spécifiée du flux</li></ul>
 * @returns {Object}
 */
export default slice;
