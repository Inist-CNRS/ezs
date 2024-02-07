import { get, clone } from 'lodash';
import { levenshteinDistance } from './algorithms';
import core from './core';

/**
 * @private
 * @param s {string | number | unknown}
 * @returns {string}
 */
export const normalize = (s) => {
    if (typeof s === 'string') {
        return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').padEnd(40, '~');
    }
    if (typeof s === 'number') {
        return s.toFixed(20).toString().padStart(40, '0');
    }
    return String(s);
};

/**
 * @private
 * @param x {string | number | unknown}
 * @param y {string | number | unknown}
 * @returns {*}
 */
const levenshtein = (x, y) => levenshteinDistance(normalize(x), normalize(y));

/**
 * @private
 * @param x {number}
 * @param y {number}
 * @returns {number}
 */
const numerical = (x, y) => (x + 1) / (y + 1);

const methods = {
    levenshtein,
    numerical,
};
const allMethods = Object.keys(methods).join(',');

/**
 * Tune function see documentation at the end.
 * This part of the doc is used for jsdoc typing
 * @private
 * @param data {unknown}
 * @param feed {Feed}
 * @param ctx {import('../../core/src/engine').EngineScope}
 */
const tune = (data, feed, ctx) => {
    if (ctx.isLast()) {
        feed.close();
        return;
    }
    const path = ctx.getParam('path', 'id');
    const method = ctx.getParam('method', 'natural');
    const fields = Array.isArray(path) ? path : [path];
    const currentValue = fields
        .filter((k) => typeof k === 'string')
        .map((key) => get(data, key))
        .shift();

    if (!methods[method] && method !== 'natural') {
        throw new Error(`Invalid parameter 'method'. Accepted values are : ${allMethods}`);
    }

    if (method === 'natural') {
        feed.send(core(normalize(currentValue), data));
        return;
    }

    if (!ctx.previousValue) {
        ctx.previousValue = currentValue;
        ctx.previousDistance = 1;
        feed.send(core(1, data));
        return;
    }

    const similarity = methods[method](ctx.previousValue, currentValue);
    const score = similarity === 0 ? Math.max(ctx.previousValue.length, currentValue.length) : similarity;
    const currentDistance = ctx.previousDistance / score;

    ctx.previousValue = clone(currentValue);
    ctx.previousDistance = clone(currentDistance);
    feed.send(core(currentDistance, data));
};

/**
 * Create and replace the id with a unified id that can be used with [sort](#sort).
 *
 * Créer et remplacer l'identifiant par un identifiant unifié qui peut être utilisé avec [sort](#sort).
 *
 * ### Example / Exemple
 *
 * #### Script / Scénario
 *
 * ```ini
 * ; Import analytics plugin required to use "tune"
 * ; Importation du plugin analytique nécessaire pour utiliser "tune"
 * [use]
 * plugin = analytics
 *
 * ; Using "tune" with default settings
 * ; Utilisation de "tune" avec les paramètres par défaut
 * [tune]
 * ; path = id
 * ; method = natural
 *
 * ```
 *
 * #### Input / Entrée
 *
 * ```json
 *  [
 *      {
 *          "id": 1,
 *          "value": 1
 *      },
 *      {
 *          "id": 2,
 *          "value": 2
 *      }
 *  ]
 * ```
 *
 * #### Output / Sortie
 *
 * ```json
 *  [
 *      {
 *          "id": "0000000000000000001.00000000000000000000",
 *          "value": {
 *              "id": 1,
 *              "value": 1,
 *              "label": "static value"
 *          }
 *      },
 *      {
 *          "id": "0000000000000000002.00000000000000000000",
 *          "value": {
 *              "id": 2,
 *              "value": 2,
 *              "label": "static value"
 *          }
 *      }
 *  ]
 * ```
 *
 * @name tune
 * @param {String} [path=id]
 *      <ul><li>path of the element used to create the unified identifier</li></ul>
 *      <ul><li>chemin de l'élément utilisé pour créer l'identifiant unifié</li></ul>
 * @param {'natural' | 'levenshtein' | 'numerical'} [method=natural]
 *      <ul><li>method used to create the unified identifier</li></ul>
 *          <ul><ul><li>natural - Create a normalised identifier that is set to a fixed length</li></ul></ul>
 *          <ul><ul><li>levenshtein - Create an identifier based on the Levenshtein algorithm</li></ul></ul>
 *          <ul><ul><li>numerical - Create an identifier based on a numeric value</li></ul></ul>
 *      <ul><li>méthode utilisée pour créer l'identifiant unifié</li></ul>
 *          <ul><ul><li>natural - Crée un identifiant normalisé de longueur fixe</li></ul></ul>
 *          <ul><ul><li>levenshtein - Crée un identifiant basé sur l'algorithme de Levenshtein</li></ul></ul>
 *          <ul><ul><li>numerical - Crée un identifiant basé sur une valeur numérique</li></ul></ul>
 * @returns {{
 *     id: String,
 *     value: Object
 * }}
 */
export default tune;

/*

AAA > null VS AAA = 1       >>  1              = 1
EEE >  AAA VS EZZ = 0.333   >>  1 / 0.33       = 3,0303
ZZZ >  EEE VS ZZZ = -0.89   >> 3,0303 / - 0,89 = −3,404831461
SSS >  ZZZ VS SSS = 1.66    >> -3,4048 / 1,66  = −2,05110329


1
--- = 0,33
EZZ


EZZ = 1 / 0,33

X    Z
- =  -
Y    1

      X * 1
 Y =  -----
      Z
      */
