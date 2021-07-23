import _ from 'lodash';

/**
 * Send the input object again, while adding new environment field(s) with the
 * first `Object` of the feed.
 *
 * @name env
 * @param {String} [path] path of the new field
 * @param {String} [value] value of the new field
 * @returns {Object}
 */
export default function env(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    if (this.isFirst()) {
        const envar = this.getEnv();
        const path = this.getParam('path', []);
        const value = this.getParam('value');
        const vals = Array.isArray(path) && !Array.isArray(value) ? [value] : value;
        if (Array.isArray(path)) {
            const values = _.take(vals, path.length);
            const assets = _.zipObject(path, values);
            Object.keys(assets).forEach((key) => {
                _.set(envar, key, assets[key]);
            });
        } else {
            _.set(envar, path, vals);
        }
    }
    return feed.send(data);
}
