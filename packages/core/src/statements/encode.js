import _ from 'lodash';
/**
 * Take an `String`, encode with specific mode
 *
 *
 * @name encode
 * @param {String} [mode = base64] mode to use (base64, uri, uuid)
 * @param {String} [path = value] the path of field to encode
 * @returns {Object}
 */
export default function encode(data, feed) {
    const mode = this.getParam('mode', 'base64');
    const path = [].concat(this.getParam('path', 'id')).shift();
    const value = String(_.get(data, path));

    if (this.isLast()) {
        return feed.close();
    }
    if (mode === 'base64') {
        _.set(data, path, Buffer.from(value).toString('base64'))
    }
    if (mode === 'uri') {
        _.set(data, path, encodeURI(value));
    }
    if (mode === 'uuid') {
        const buf = Buffer.alloc(16);
        Buffer.from(value).copy(buf);
        const hex = buf.toString('hex');
        _.set(data, path, `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`);
    }
    return feed.send(data);
}
