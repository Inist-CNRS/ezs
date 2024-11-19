import _ from 'lodash';

/**
 * Crée une variable d'environnement globale à tout le script.
 *
 * On l'utilise en général au début du script (après `[use]`).
 *
 * Pour utiliser la variable, il faut employer la fonction `env()`.
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
 * }]
 * ```
 *
 * Script:
 *
 * ```ini
 * [use]
 * plugin = basics
 *
 * [env]
 * path = nom
 * value = NOM GÉNÉRIQUE
 *
 * [JSONParse]
 *
 * [assign]
 * path = nom
 * value = env("nom")
 *
 * [dump]
 * indent = true
 * ```
 *
 * Sortie:
 *
 * ```json
 * [{
 *     "nom": "NOM GÉNÉRIQUE",
 *     "valeur": 1
 * },
 * {
 *     "nom": "NOM GÉNÉRIQUE",
 *     "valeur": 2
 * }]
 * ```
 *
 * @name env
 * @param {String} [path] nom de la variable à créer
 * @param {String} [value] valeur de la variable
 * @returns {Object}
 */
function envFunction(envar, path, value) {
    if (Array.isArray(path)) {
        const values = _.take(value, path.length);
        const assets = _.zipObject(path, values);
        Object.keys(assets).forEach((key) => {
            _.set(envar, key, assets[key]);
        });
    } else {
        _.set(envar, path, value);
    }
}

export default function env(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    if (this.isFirst()) {
        const envar = this.getEnv();
        const path = this.getParam('path', []);
        const value = this.getParam('value');
        const vals = Array.isArray(path) && !Array.isArray(value) ? [value] : value;
        envFunction(envar, path, vals);
    }
    return feed.send(data);
}
