function TXTObject(data, feed) {
    if (this.isLast()) {
        return feed.send(data);
    }
    const key = this.getParam('key', 'value');
    if (typeof key !== 'string') {
        throw new Error('Invalid parameter : key is not a string');
    }
    const obj = {};
    obj[key] = data;
    feed.send(obj);
}

/**
 * Take `String` and generate an object with a key and a value, where the value is the input string.
 *
 * @name TXTObject
 * @param {String} [key=value] choose a the key name
 * @returns {Object}
 */
export default {
    TXTObject,
};
