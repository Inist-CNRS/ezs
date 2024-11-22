import _ from 'lodash';

/**
 * Affecte une valeur à un champ de l'objet courant.
 * Si le champ existe déjà, sa valeur est écrasée, sinon il est créé
 *
 * Entrée:
 *
 * ```json
 * [{
 *     "nom": "un",
 *     "valeur": 1
 * },
 * {
 *     "nom": "deux",
 *     "valeur": 2
 * },
 * {
 *     "nom": "trois",
 *     "valeur": 3
 * },
 * {
 *     "nom": "quatre",
 *     "valeur": 4
 * }]
 * ```
 *
 * Script:
 *
 * ```ini
 * [assign]
 * path = valeur
 * value = get("valeur").multiply(2)
 * ```
 *
 * Output:
 *
 * ```json
 * [{
 *     "nom": "un",
 *     "valeur": 2
 * },
 * {
 *     "nom": "deux",
 *     "valeur": 4
 * },
 * {
 *     "nom": "trois",
 *     "valeur": 6
 * },
 * {
 *     "nom": "quatre",
 *     "valeur": 8
 * }]
 * ```
 *
 * Le `path` peut être le nom simple d'un champ présent à la racine de l'élément
 * traité, ou un chemin en [notation
 * pointée](https://goessner.net/articles/JsonPath/index.html#e2), en utilisant
 * une syntaxe proche de celle de la fonction
 * [`get`](https://lodash.com/docs/4.17.15#get) de Lodash.
 *
 * @name assign
 * @param {String} [path] chemin du champ à affecter
 * @param {String} [value] valeur à affecter
 * @returns {Object}
 *
 * @see [exchange](#exchange)
 */
function assignFunction(data, path, value) {
    if (Array.isArray(path)) {
        const values = _.take(value, path.length);
        const assets = _.zipObject(path, values);
        Object.keys(assets).forEach((key) => {
            _.set(data, key, assets[key]);
        });
    } else {
        _.set(data, path, value);
    }
}

export default function assign(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const path = this.getParam('path', []);
    const value = this.getParam('value');
    const vals = Array.isArray(path) && !Array.isArray(value) ? [value] : value;
    assignFunction(data, path, vals);
    return feed.send(data);
}
