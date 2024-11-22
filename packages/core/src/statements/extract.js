import _ from 'lodash';

/**
 * Extrait de l'objet courant les valeurs de certains champs, et renvoie
 * directement les valeurs dans le flux de sortie.
 *
 * > **Note**: `extract` ne peut pas fournir des valeurs `undefined` ou `null`.
 *
 * Entrée:
 *
 * ```json
 * [{
 *    "nom": "un",
 *    "valeur": 1,
 *    "important": false
 * },
 * {
 *    "nom": "deux",
 *    "valeur": 2,
 *    "important": true
 * }]
 * ```
 *
 * Script:
 *
 * ```ini
 * [use]
 * plugin = basics
 *
 * [JSONParse]
 *
 * [extract]
 * path = valeur
 * path = nom
 *
 * [dump]
 * ```
 *
 * Sortie:
 *
 * ```json
 * [[1,"un"],[2,"deux"]]
 * ```
 *
 * @name extract
 * @param {String} [path] chemin d'un champ à extraire
 * @returns {Object}
 *
 * @see [assign](#assign)
 * @see [exchange](#exchange)
 */
export default function extract(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    let keys = this.getParam('path', []);
    if (!Array.isArray(keys)) {
        keys = [keys];
    }

    keys = keys.filter(Boolean).filter((k) => typeof k === 'string');
    const values = keys
        .map((key) => _.get(data, key))
        .filter((v) => v !== null && v !== undefined);

    if (values.length === 0) {
        return feed.send(new Error('Nonexistent path.'));
    } if (values.length === 1) {
        return feed.send(values[0]);
    }
    return feed.send(values);
}
