import damerauLevenshtein from 'talisman/metrics/distance/damerau-levenshtein';
import dice from 'talisman/metrics/distance/dice';
import jaccard from 'talisman/metrics/distance/jaccard';
import jaroWinkler from 'talisman/metrics/distance/jaro-winkler';
import jaro from 'talisman/metrics/distance/jaro';
import levenshtein from 'talisman/metrics/distance/levenshtein';
import cosine from 'talisman/metrics/distance/cosine';
import euclidean from 'talisman/metrics/distance/euclidean';
import get from 'lodash.get';
import clone from 'lodash.clone';
import core from './core';


const vector = (input, size) => {
    const v = Array(size).fill(0);
    input.split('').map(x => x.charCodeAt(0)).forEach((x, i) => v[i] = x);
    return v;
};

const cosineVector = (x, y) => {
    const m = Math.max(x.length, y.length);
    return cosine(vector(x, m), vector(y, m));
}

const euclideanVector = (x, y) => {
    const m = Math.max(x.length, y.length);
    return euclidean(vector(x, m), vector(y, m));
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
    cosineVector,
    euclideanVector,
    numerical
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
    const method = this.getParam('method', 'jaro');
    const fields = Array.isArray(path) ? path : [path];

    if (!methods[method]) {
        throw new Error(`Invalid parameter 'method'. Accepted values are : ${allMethods}`);
    }

    const currentValue = fields
        .filter(k => typeof k === 'string')
        .map(key => get(data, key))
        .shift();

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
