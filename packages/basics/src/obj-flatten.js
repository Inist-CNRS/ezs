import flatten from 'flat';

function OBJFlatten(data, feed) {
    const opts = {
        delimiter: this.getParam('separator', '/'),
        safe: this.getParam('safe', true),
    };
    if (this.isLast()) {
        feed.close();
    } else {
        feed.send(flatten(data, opts));
    }
}

/**
 * Take `Object` and flat it with delimited character.
 *
 * @name OBJFlatten
 * @alias flatten
 * @param {String} [separator=/] choose a character for  flatten keys
 * @returns {Object}
 * @see https://www.npmjs.com/package/flat
 */
export default {
    OBJFlatten,
};
