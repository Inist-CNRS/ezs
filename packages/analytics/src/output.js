import { get, unset } from 'lodash';
/**
 * Pair function see documentation at the end.
 * This part of the doc is used for jsdoc typing
 * @private
 * @param data {unknown}
 * @param feed {Feed}
 * @param ctx {import('../../core/src/engine').EngineScope}
 */
const output = (data, feed, ctx) => {
    const indent = ctx.getParam('indent', false);
    const extract = ctx.getParam('meta');
    const extracts = Array.isArray(extract) ? extract : [extract];
    const keys = extracts.filter((x) => x);
    const cr = indent ? '\n    ' : '';

    const json = (d) => JSON.stringify(d, null, indent ? '    ' : null);

    if (ctx.isLast()) {
        feed.write(`]}${cr}`);
        return feed.close();
    }
    if (ctx.isFirst() && !ctx.isLast()) {
        const values = keys.map((p) => get(data, p));
        feed.write(`{${cr}"meta":{${cr}`);
        if (keys.length > 0) {
            let check = false;
            keys.forEach((k, index) => {
                if (values[index]) {
                    feed.write(!check ? ' ' : ',');
                    check = true;
                    feed.write(json(k));
                    feed.write(':');
                    feed.write(json(values[index]));
                }
            });
        }
        feed.write(`},${cr}"data":[${cr}`);
    } else {
        feed.write(`,${cr}`);
    }
    keys.forEach((p) => unset(data, p));
    feed.write(json(data));
    return feed.end();
};

/**
 * Create an output string containing all incoming elements in a `data` array.
 * with given `meta` extracted into an object called `meta`.
 *
 * Créer une sortie en chain de caratere avec les element entrent mise dans un tableau nommé `data`
 * eyent les donnée `meta` extrais et mises dans un objet appelé `meta`.
 *
 * #### Script / Scénario
 *
 * ##### ini
 *
 * ```ini
 * ; Import analytics plugin required to use "output"
 * ; Importation du plugin analytique nécessaire pour utiliser "output"
 * [use]
 * plugin = analytics
 *
 * ; Using "output" with 'indent' as true and 'meta' as total
 * ; Utilisation de "output" avec 'indent' à vrai et total comme paramètres de 'meta'
 * [output]
 * indent = true
 * meta = total
 *
 * ```
 *
 * #### Input / Entrée
 *
 * ```json
 *  [
 *      { "_id": 1, "value": 2, "total": 2 },
 *      { "_id": 2, "value": 4, "total": 2 }
 *  ]
 * ```
 *
 * #### Output / Sortie
 *
 * !!! Attention: This is an output function that can only be used at the end of an EZS script. !!!
 * !!! The output is a string and can't be used with other EZS functions.                       !!!
 *
 * !!! Attention : Ceci est une fonction de sortie, Elle peut uniquement etre utilisé à la fin d'un script ezs !!!
 * !!! Cette sortie est une chaine de carater et ne peut pas etre utilisé avec d'autre fonction ezs            !!!
 *
 * ```json
 *  {
 *      "data": [
 *          { "_id": 1, "value": 2 },
 *          { "_id": 2, "value": 4 }
 *      ],
 *      "meta": {
 *          "total": 2
 *      }
 *  }
 * ```
 *
 * @name output
 * @param {Boolean}  [indent=false]
 *      <ul><li>indent the output json</li></ul>
 *      <ul><li>indenté le json de sortie</li></ul>
 * @param {String} [meta]
 *      <ul><li>element from the input to put it in the `meta` object</li></ul>
 *      <ul><li>élément a extraire de l'entrée et a mettre dans l'objet `meta`</li></ul>
 * @returns {String}
 */
export default {
    output,
};
