import set  from 'lodash/set.js';

const eol = '\n';
/**
 * Take all `Object`, throw encoded `String`
 *
 * @name pack
 * @param {String} [path] path to set in the serialize object (default: none)
 * @returns {String}
 */
export default function pack(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const path = [].concat(this.getParam('path', [])).filter(Boolean).shift();
    const value = !path ? data : set({}, path, data);
    return feed.send(JSON.stringify(value).concat(eol));
}
