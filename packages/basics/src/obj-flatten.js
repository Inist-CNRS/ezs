import flatten from 'flat';

function OBJFlatten(data, feed) {
    const opts = {
        delimiter: this.getParam('separator', '/'),
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
 * @param {String} [separator=/] choose a character for  flatten keys
 * @returns {Object}
 */
export default {
    OBJFlatten,
};
