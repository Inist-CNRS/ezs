import _ from 'lodash';

/**
 * Take `Object` and create a new object with some fields
 *
 * @param {String} [path] path of the new field
 * @param {String} [value] value of the new field
 * @returns {Object}
 */
export default function replace(data, feed) {
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


