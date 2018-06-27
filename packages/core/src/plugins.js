import _ from 'lodash';
import util from 'util';
import JSONezs from './json';

/**
 * Take `Object` and add new field
 *
 * @name assign
 * @param {String} [path] path of the new field
 * @param {String} [value] value of the new field
 * @returns {Object}
 */
function assign(data, feed) {
    if (this.isLast()) {
        return feed.send(data);
    }
    const test = this.getParam('test', true);
    if (!test) {
        return feed.send(data);
    }
    const path = this.getParam('path', []);
    const value = this.getParam('value');
    const vals = Array.isArray(path) && !Array.isArray(value) ? [value] : value;
    if (Array.isArray(path)) {
        const values = _.take(vals, path.length);
        const assets = _.zipObject(path, values);
        Object.keys(assets).forEach((key) => {
            _.set(data, key, assets[key]);
        });
    } else {
        _.set(data, path, vals);
    }
    return feed.send(data);
}

/**
 * Take `Object` and create a new object with some fields
 *
 * @name replace
 * @param {String} [path] path of the new field
 * @param {String} [value] value of the new field
 * @returns {Object}
 */
function replace(data, feed) {
    if (this.isLast()) {
        return feed.send(data);
    }
    const test = this.getParam('test', true);
    if (!test) {
        return feed.send(data);
    }
    const path = this.getParam('path', []);
    const value = this.getParam('value');
    const vals = Array.isArray(path) && !Array.isArray(value) ? [value] : value;
    const obj = {};
    if (Array.isArray(path)) {
        const values = _.take(vals, path.length);
        const assets = _.zipObject(path, values);
        Object.keys(assets).forEach((key) => {
            _.set(obj, key, assets[key]);
        });
    } else {
        _.set(obj, path, vals);
    }
    return feed.send(obj);
}

/**
 * Take `Object` , print it and throw the same object
 *
 * @name debug
 * @param {String} [level=log] console level : log or error
 * @param {String} [text=valueOf] text before the dump
 * @returns {Object}
 */
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

/**
 * Take `Object` and throw the same object
 *
 * @name transit
 * @returns {Object}
 */
function transit(data, feed) {
    return feed.send(data);
}

/**
 * Take the first `Object` and close the feed
 *
 * @name shift
 * @returns {Object}
 */
function shift(data, feed) {
    feed.write(data);
    feed.close();
}

/**
 * Take `Object` and throw each value of fields
 *
 * @name extract
 * @param {String} [path] path of field to extract
 * @returns {Object}
 */
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

/**
 * Take `Object` and throw the same object but keep only
 * spefici fields
 *
 * @name keep
 * @param {String} [path] path of field to keep
 * @returns {Object}
 */
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

/**
 * Take all `String`, concat them and thow just one
 *
 * @name concat
 * @param {String} [beginWith] Add value at the begin
 * @param {String} [joinWith] use value to join 2 chunk
 * @param {String} [endWith] Add value at the end
 * @returns {String}
 */
function concat(data, feed) {
    const beginWith = this.getParam('beginWith', '');
    const joinWith = this.getParam('joinWith', '');
    const endWith = this.getParam('endWith', '');

    if (this.buffer === undefined) {
        this.buffer = beginWith;
    }
    if (this.isLast()) {
        feed.send(this.buffer.concat(endWith));
        return feed.close();
    }
    if (!this.isFirst()) {
        this.buffer = this.buffer.concat(joinWith);
    }
    this.buffer = this.buffer.concat(data);
    return feed.end();
}

/**
 * Take all `String`, throw `Object` builded by JSON.parse
 *
 * @name json
 * @returns {String}
 */
function json(data, feed) {
    if (this.isLast()) {
        return feed.send(data);
    }
    return feed.send(JSON.parse(data));
}

function jsonezs(data, feed) {
    if (this.isLast()) {
        return feed.send(data);
    }
    return feed.send(JSONezs.parse(data));
}

/**
 * Take all `Object`, throw encoded `String`
 *
 * @name encoder
 * @returns {String}
 */
function encoder(data, feed) {
    if (this.isLast()) {
        return feed.send(data);
    }
    return feed.send(JSON.stringify(data).concat('\n'));
}

export default {
    extract,
    assign,
    replace,
    shift,
    keep,
    debug,
    concat,
    json,
    jsonezs,
    encoder,
    transit,
};
