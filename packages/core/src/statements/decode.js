import _ from 'lodash';
/**
 * Take an `String`, decode with specific mode
 *
 *
 * @name decode
 * @param {String} [mode = base64] mode to use (base64, uri, uuid, bigint)
 * @param {String} [path = value] the path of field to decode
 * @returns {Object}
 */
export default function decode(data, feed) {
    const mode = this.getParam('mode', 'base64');
    const path = [].concat(this.getParam('path', 'id')).shift();
    const value = String(_.get(data, path));

    if (this.isLast()) {
        return feed.close();
    }
    if (mode === 'base64') {
        _.set(data, path, Buffer.from(value, 'base64').toString())
    }
    if (mode === 'uri') {
        _.set(data, path, decodeURI(value));
    }
    if (mode === 'uuid') {
        const hex = value.replace(/-/g, '');
        _.set(data, path, Buffer.from(hex, 'hex').toString('utf8').replace(/\0+$/, ''));
    }
    return feed.send(data);
}
