import _ from 'lodash';
import util from 'util';

function assign(data, feed) {
    if (this.isLast()) {
        return feed.send(data);
    }
    const test = this.getParam('test', true);
    if (!test) {
        return feed.send(data);
    }
    const params = this.getParams();

    // check if missing value
    if (Array.isArray(params.path) && !Array.isArray(params.value)) {
        params.value = [params.value];
    }
    const keys = this.getParam('path', []);
    const vals = this.getParam('value', []);

    if (Array.isArray(keys)) {
        const values = _.take(vals, keys.length);
        const assets = _.zipObject(keys, values);
        Object.keys(assets).forEach((key) => {
            _.set(data, key, assets[key]);
        });
    } else {
        _.set(data, keys, vals);
    }
    return feed.send(data);
}

function replace(data, feed) {
    if (this.isLast()) {
        return feed.send(data);
    }
    const test = this.getParam('test', true);
    if (!test) {
        return feed.send(data);
    }
    const params = this.getParams();

    // check if missing value
    if (Array.isArray(params.path) && !Array.isArray(params.value)) {
        params.value = [params.value];
    }
    const keys = this.getParam('path', []);
    const vals = this.getParam('value', []);
    const obj = {};
    if (Array.isArray(keys)) {
        const values = _.take(vals, keys.length);
        const assets = _.zipObject(keys, values);
        Object.keys(assets).forEach((key) => {
            _.set(obj, key, assets[key]);
        });
    } else {
        _.set(obj, keys, vals);
    }
    return feed.send(obj);
}

function debug(data, feed) {
    if (this.isLast()) {
        return feed.send(data);
    }
    const level = this.getParam('level', 'log');
    const text = this.getParam('text', 'valueOf');
    if (typeof console[level] === 'function') {
        const logOpts = { showHidden: false, depth: 3, colors: true };
        const logFunc = console[level];
        logFunc(text.concat('#').concat(this.getIndex()).concat(' ->'), util.inspect(data, logOpts));
    }
    return feed.send(data);
}

function shift(data, feed) {
    feed.write(data);
    feed.close();
}

function extract(data, feed) {
    if (this.isLast()) {
        return feed.send(data);
    }
    let keys = this.getParam('path', []);
    if (!Array.isArray(keys)) {
        keys = [keys];
    }

    keys = keys.filter(k => typeof k === 'string');
    const values = keys.map(key => _.get(data, key)).filter(val => val);

    if (values.length === 0) {
        return feed.send(new Error('Nonexistent path.'));
    } else if (values.length === 1) {
        return feed.send(values[0]);
    }
    return feed.send(values);
}

function keep(data, feed) {
    if (this.isLast()) {
        return feed.send(data);
    }
    let keys = this.getParam('path', []);
    if (!Array.isArray(keys)) {
        keys = [keys];
    }
    const obj = {};
    keys.filter(k => typeof k === 'string').forEach(key => _.set(obj, key, _.get(data, key)));
    return feed.send(obj);
}

export default {
    assign,
    replace,
    shift,
    extract,
    keep,
    debug,
};
