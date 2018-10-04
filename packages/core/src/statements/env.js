import _ from 'lodash';

/**
 * Take `Object` and send the same object
 * but in the meantime, it is possible to add
 * new environment field
 *
 * @param {String} [path] path of the new field
 * @param {String} [value] value of the new field
 * @returns {Object}
 */
export default function env(data, feed) {
    if (this.isLast()) {
        return feed.send(data);
    }
    const env = this.getEnv();
    const path = this.getParam('path', []);
    const value = this.getParam('value');
    const vals = Array.isArray(path) && !Array.isArray(value) ? [value] : value;
    if (Array.isArray(path)) {
        const values = _.take(vals, path.length);
        const assets = _.zipObject(path, values);
        Object.keys(assets).forEach((key) => {
            _.set(env, key, assets[key]);
        });
    } else {
        _.set(env, path, vals);
    }
    return feed.send(data);
}


