import set  from 'lodash/set.js';

const eol = '\n';

/**
 * Encode a value as one line of `pack` (an `Error` becomes { __Error }, see unpack)
 *
 * @private
 */
export const packLine = (ezs, data, path) => {
    const key = [].concat(path || []).filter(Boolean).shift();
    const value = !key ? data : set({}, key, data);
    const replacer = (k, val) => val instanceof Error ? { '__Error': ezs.serializeError(val) } : val;
    return JSON.stringify(value, replacer).concat(eol);
};

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
    return feed.send(packLine(this.ezs, data, this.getParam('path')));
}
