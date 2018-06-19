import get from 'lodash.get';
import core from './core';

/**
 * Take `Object` object getting some fields with json path, and do ...
 *
 * @name distinct
 * @param {String} path
 * @returns {Object}
 */
export default function pair(data, feed) {
    if (this.isLast()) {
        feed.close();
        return;
    }
    let fields = this.getParam('path', []);
    if (!Array.isArray(fields)) {
        fields = [fields];
    }

    const values = fields
        .map(key => get(data, key))
        .filter(x => x)
        .map(item => (item instanceof Array ? item : [item]));

    values
        .forEach((v, i) => {
            const a = values.slice(i + 1).reduce((pre, cur) => pre.concat(cur), []);
            if (a.length > 0) {
                v.forEach((w) => {
                    a.forEach(x => feed.write(core(JSON.stringify([w, x]), 1)));
                });
            }
        });

    feed.end();
}
