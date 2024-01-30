import { get, clone } from 'lodash';
import { levenshteinDistance } from './algorithms';
import core from './core';

export const normalize = (s) => {
    if (typeof s === 'string') {
        return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').padEnd(40, '~');
    }
    if (typeof s === 'number') {
        return s.toFixed(20).toString().padStart(40, '0');
    }
    return String(s);
};

const levenshtein = (x, y) => levenshteinDistance(normalize(x), normalize(y));
const numerical = (x, y) => (x + 1) / (y + 1);

const methods = {
    levenshtein,
    numerical,
};
const allMethods = Object.keys(methods).join(',');

/**
 * Take all `Object` and sort them with selected field
 *
 * ```json
 * [{
 * }]
 * ```
 *
 * Script:
 *
 * ```ini
 * [use]
 * plugin = analytics
 *
 * [tune]
 *
 * ```
 *
 * Output:
 *
 * ```json
 * [
 * ]
 * ```
 *
 * @name tune
 * @param {String} [path=id] path to use for the sort key
 * @returns {Object}
 */
export default function tune(data, feed) {
    if (this.isLast()) {
        feed.close();
        return;
    }
    const path = this.getParam('path', 'id');
    const method = this.getParam('method', 'natural');
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

    if (!this.previousValue) {
        this.previousValue = currentValue;
        this.previousDistance = 1;
        feed.send(core(1, data));
        return;
    }

    const similarity = methods[method](this.previousValue, currentValue);
    const score = similarity === 0 ? Math.max(this.previousValue.length, currentValue.length) : similarity;
    const currentDistance = this.previousDistance / score;

    this.previousValue = clone(currentValue);
    this.previousDistance = clone(currentDistance);
    feed.send(core(currentDistance, data));
}

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
