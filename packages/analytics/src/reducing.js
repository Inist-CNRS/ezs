import get from 'lodash.get';
import core from './core';
/**
 * Take `Object` group value of { _id, value } objectpath
 *
 * @name reducing
 * @param {undefined} none
 * @returns {Object}
 */
export default function reducing(data, feed) {
    if (!this.stats) {
        this.stats = {};
    }
    if (this.isFirst()) {
        this.stats = { };
    }
    if (this.isLast()) {
        Object.keys(this.stats).forEach(key => feed.write(core(key, this.stats[key])));
        feed.close();
        return;
    }
    const id = get(data, this.getParam('id', 'id'));
    const value = get(data, this.getParam('value', 'value'));
    if (id && value) {
        if (this.stats[id] === undefined) {
            this.stats[id] = [];
        }
        this.stats[id].push(value);
    }

    feed.end();
}
