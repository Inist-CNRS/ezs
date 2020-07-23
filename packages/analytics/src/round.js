/* eslint-disable no-redeclare */
/* eslint-disable block-scoped-var */
/* eslint-disable vars-on-top */
/* eslint-disable no-var */
/* eslint-disable eqeqeq */
/* eslint-disable no-param-reassign */


import get from 'lodash.get';
/**
 *
 * @name round
 * @param {String} [path=value] path of the rounded value
 * @param {String} [type=round] round (default setting), default or excess
 * @returns {Object}
 */

export default function round(data, feed) {
    if (this.isLast()) {
        feed.close();
        return;
    }
    const path = this.getParam('path', 'value');
    const type = this.getParam('type', 'round');
    const key = Array.isArray(path) ? path.shift() : path;
    const value = Number(get(data, key)) || 0;
    if (type == 'round') {
        var rounded = Math.round(value);
    } else if (type == 'default') {
        var rounded = Math.floor(value);
    } else if (type == 'excess') {
        var rounded = Math.ceil(value);
    }
    data = rounded;

    feed.send(data);
}
