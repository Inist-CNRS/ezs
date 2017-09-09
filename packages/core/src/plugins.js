import _ from 'lodash';

function attribute(data, feed) {
    if (this.isLast()) {
        return feed.send(data);
    }
    let keys = this.getParam('label', []);
    if (keys.length === 0) {
        keys = this.getParam('key', []);
    }
    let values = this.getParam('value', []);
    if (!Array.isArray(keys)) {
        keys = [keys];
    }
    if (!Array.isArray(values)) {
        values = [values];
    }
    keys = keys.filter(k => typeof k === 'string');
    values = _.take(values, keys.length);
    const assets = _.zipObject(keys, values);

    Object.keys(assets).forEach((key) => {
        _.set(data, key, assets[key]);
    });
    return feed.send(data);
}

function substitute(data, feed) {
    if (this.isLast()) {
        return feed.send(data);
    }
    let keys = this.getParam('label', []);
    if (keys.length === 0) {
        keys = this.getParam('key', []);
    }
    let values = this.getParam('value', []);
    if (!Array.isArray(keys)) {
        keys = [keys];
    }
    if (!Array.isArray(values)) {
        values = [values];
    }
    keys = keys.filter(k => typeof k === 'string');
    values = _.take(values, keys.length);
    const assets = _.zipObject(keys, values);
    const obj = {};
    Object.keys(assets).forEach((key) => {
        _.set(obj, key, assets[key]);
    });
    return feed.send(obj);
}

function tag(data, feed) {
    if (this.isLast()) {
        return feed.send(data);
    }
    const tagName = this.getParam('name', 'tag');
    const tagTest = this.getParam('test', true);
    if (tagTest) {
        data.__tagName = () => tagName;
    }
    return feed.send(data);
}

function debug(data, feed) {
    if (this.isLast()) {
        return feed.send(data);
    }
    const level = this.getParam('level', 'log');
    const text = this.getParam('text', 'valueOf');
    if (typeof console[level] === 'function') {
        console[level](text.concat('#').concat(this.getIndex()).concat(' ->'), data);
    }
    return feed.send(data);
}

export default {
    attribute,
    substitute,
    tag,
    debug,
};
