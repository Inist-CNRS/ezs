import flatten from 'flat';

/**
 * Take `Object` and flat it with delimited character.
 *
 * @name OBJFlatten
 * @param {String} [separator=/] choose a character for  flatten keys
 * @param {Boolean} [safe=false] preserve arrays and their contents,
 * @returns {Object}
 * @see https://www.npmjs.com/package/flat
 */
export default function OBJFlatten(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const opts = {
        delimiter: String(this.getParam('separator', '/')),
        safe: Boolean(this.getParam('safe', true)),
    };
    if (this.getParam('reverse', false)) {
        return feed.send(unflatten(data, opts));
    }
    return feed.send(flatten(data, opts));
}
