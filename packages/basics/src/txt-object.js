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

export default {
    TXTObject,
};
