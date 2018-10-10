import damerauLevenshtein from 'talisman/metrics/distance/damerau-levenshtein';
import dice from 'talisman/metrics/distance/dice';
import jaccard from 'talisman/metrics/distance/jaccard';
import jaroWinkler from 'talisman/metrics/distance/jaro-winkler';
import jaro from 'talisman/metrics/distance/jaro';
import levenshtein from 'talisman/metrics/distance/levenshtein';
import _cosine from 'talisman/metrics/distance/cosine';
import _hamming from 'talisman/metrics/distance/hamming';
import _euclidean from 'talisman/metrics/distance/euclidean';
import _canberra from 'talisman/metrics/distance/canberra';
import _chebyshev from 'talisman/metrics/distance/chebyshev';
import _manhattan from 'talisman/metrics/distance/manhattan';

import get from 'lodash.get';
import clone from 'lodash.clone';
import core from './core';



const normalize = (s) => {
    if (typeof s === 'string') {
        return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').padEnd(40, '~');
    } else if (typeof s === 'number') {
        return s.toFixed(20).toString().padStart(40, '0');
    } else {
        return String(s);
    }
}

const vector = (input, size) => {
    const v = Array(size).fill(0);
    input.split('').map(x => x.charCodeAt(0)).forEach((x, i) => v[i] = x);
    return v;
};

const cosine = (x, y) => {
    const m = Math.max(x.length, y.length);
    return _cosine(vector(normalize(x), m), vector(normalize(y), m));
}

const hamming = (x, y) => {
    const m = Math.max(x.length, y.length);
    return _hamming(vector(normalize(x), m), vector(normalize(y), m));
}

const euclidean = (x, y) => {
    const m = Math.max(x.length, y.length);
    return _euclidean(vector(normalize(x), m), vector(normalize(y), m));
}

const canberra = (x, y) => {
    const m = Math.max(x.length, y.length);
    return _canberra(vector(normalize(x), m), vector(normalize(y), m));
}

const chebyshev = (x, y) => {
    const m = Math.max(x.length, y.length);
    return _chebyshev(vector(normalize(x), m), vector(normalize(y), m));
}

const manhattan = (x, y) => {
    const m = Math.max(x.length, y.length);
    return _manhattan(vector(normalize(x), m), vector(normalize(y), m));
}

const numerical = (x, y) => {
    return (x + 1) / ( y + 1);
}



const methods = {
    damerauLevenshtein,
    dice,
    jaccard,
    jaroWinkler,
    jaro,
    levenshtein,
    cosine,
    hamming,
    euclidean,
    canberra,
    chebyshev,
    manhattan,
    numerical,
};
const allMethods = Object.keys(methods).join(',');

/**
 * Take all `Object` and sort them with selected field
 *
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
        .filter(k => typeof k === 'string')
        .map(key => get(data, key))
        .shift();

    if (!methods[method] && method !== 'natural') {
        throw new Error(`Invalid parameter 'method'. Accepted values are : ${allMethods}`);
    }


    if (method === 'natural') {
        return feed.send(core(normalize(currentValue), data));

    }


    if (!this.previousValue) {
        this.previousValue = currentValue;
        this.previousDistance = 1;
        return feed.send(core(1, data));
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
