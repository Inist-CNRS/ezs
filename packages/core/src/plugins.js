import _ from 'lodash';

function assignement(data, feed) {
    if (this.isLast()) {
        return feed.send(data);
    }
    let keys = this.getParam('key', []);
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

export default {
    assignement,
};
