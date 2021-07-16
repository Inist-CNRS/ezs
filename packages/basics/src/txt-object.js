function TXTObject(data, feed) {
    if (this.isLast()) {
        return feed.send(data);
    }
    const key = this.getParam('key', 'value');
    if (typeof key !== 'string') {
        throw new Error('Invalid parameter: key is not a string');
    }
    const obj = {};
    obj[key] = data;
    feed.send(obj);
}

/**
 * Take an array of values and generate an array containing objects with the
 * given `key` and matching value from the input array.
 *
 * Input:
 *
 * ```json
 * [1, "b"]
 * ```
 *
 * Output:
 *
 * ```json
 * [{ "value": 1 }, { "value": "b" }]
 * ```
 *
 * @name TXTObject
 * @param {String} [key="value"] choose a the key name
 * @returns {Object}
 */
export default {
    TXTObject,
};
