/**
 * Remplace tout un objet par un autre (au sens JSON).
 *
 * Entrée:
 *
 * ```json
 * [{
 *    "nom": "un",
 *    "valeur": 1
 * },
 * {
 *    "nom": "deux",
 *    "valeur": 2
 * }]
 *
 * Script:
 *
 * ```ini
 * [use] plugin = basics
 *
 * [JSONParse]
 *
 * [exchange] value = get("nom")
 *
 * [dump]
 * ```
 *
 * Sortie:
 *
 * ```json
 * ["un","deux"]
 * ```
 *
 * Ici, 'objet `{"nom":"un","valeur":1}` a été remplacé par l'« objet » (au sens
 * JSON, une chaîne de caractères, tout autant qu'un nombre, constitue un objet)
 * `"un"`.
 *
 * Note: `assign` ne permet pas de remplacer tout l'objet, mais seulement une de
 * ses propriétés.
 *
 * Entrée:
 *
 * ```json
 * [{
 *    "a": "abcdefg", "b": "1234567", "c": "XXXXXXX"
 * },
 * {
 *    "a": "abcdefg", "b": "1234567", "c": "XXXXXXX"
 * }]
 * ```
 *
 * Script:
 *
 * ```ini
 * [exchange]
 * value = omit('c')
 * ```
 *
 * Output:
 *
 * ```json
 * [{
 *    "a": "abcdefg",
 *    "b": "1234567"
 * },
 * {
 *    "a": "abcdefg",
 *    "b": "1234567"
 * }]
 * ```
 *
 * Ici, on a remplacé un objet avec trois propriétés par le même objet sans la
 * propriété `c` (voir la function
 * [`omit`](https://lodash.com/docs/4.17.15#omit) de Lodash).
 *
 * @name exchange
 * @param {String} [value] la valeur de remplacement de l'objet courant
 * @returns {Object}
 *
 * @see [assign](#assign)
 * @see [extract](#extract)
 */
export default function exchange(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const value = this.getParam('value', []);
    const values = Array.isArray(value) ? value : [value];

    if (values.length === 1) {
        return feed.send(values.shift());
    }
    return feed.send(values);
}
