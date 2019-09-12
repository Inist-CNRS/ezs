import get from 'lodash.get';
import uniq from 'lodash.uniq';
import core from './core';

function levenshteinDistance(a, b) {
    // Create empty edit distance matrix for all possible modifications of
    // substrings of a to substrings of b.
    const distanceMatrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));

    // Fill the first row of the matrix.
    // If this is first row then we're transforming empty string to a.
    // In this case the number of transformations equals to size of a substring.
    for (let i = 0; i <= a.length; i += 1) {
        distanceMatrix[0][i] = i;
    }

    // Fill the first column of the matrix.
    // If this is first column then we're transforming empty string to b.
    // In this case the number of transformations equals to size of b substring.
    for (let j = 0; j <= b.length; j += 1) {
        distanceMatrix[j][0] = j;
    }

    for (let j = 1; j <= b.length; j += 1) {
        for (let i = 1; i <= a.length; i += 1) {
            const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
            distanceMatrix[j][i] = Math.min(
                distanceMatrix[j][i - 1] + 1, // deletion
                distanceMatrix[j - 1][i] + 1, // insertion
                distanceMatrix[j - 1][i - 1] + indicator, // substitution
            );
        }
    }

    return distanceMatrix[b.length][a.length];
}

const equalTo = (id, distance) => (item) => item.id.some((key) => levenshteinDistance(key, id) <= distance);

/**
 * Take `Object` like `{ id, value }` and reduce all `value`s with
 * `id` which have the same Levenshtein distance in a single object
 *
 * @name groupingByLevenshtein
 * @param {String} [id=id] path to use for id
 * @param {String} [value=value] path to use for value
 * @param {Number} [distance=1] minimal levenshtein distance to have a same id
 * @returns {Object}
 */
export default function groupingByLevenshtein(data, feed) {
    if (!this.stats) {
        this.stats = [];
    }
    if (this.isLast()) {
        this.stats.forEach((key) => feed.write(core(key.id, key.value)));
        feed.close();
        return;
    }
    const distance = Number(this.getParam('distance', 1)) || 1;
    const id = get(data, this.getParam('id', 'id')) || this.getIndex();
    const value = get(data, this.getParam('value', 'value'));
    const finder = equalTo(id, distance);
    if (id && value) {
        const idx = this.stats.findIndex(finder);
        if (idx === -1) {
            this.stats.push(core([id], [value]));
        } else {
            this.stats[idx].id.push(id);
            this.stats[idx].id = uniq(this.stats[idx].id);
            this.stats[idx].value.push(value);
        }
    }

    feed.end();
}
