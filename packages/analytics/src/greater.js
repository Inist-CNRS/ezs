import get from 'lodash.get';

/**
 * Take `Object` and throw the same object only if there the value of the select field is greater (or equal) than a value 
 *
 * @param {String} [path=value] path of the field to compare
 * @param {Number} [than=0] value to compare
 * @param {Boolean} [strict=false] greater than but not equal
 * @returns {Object}
 */
export default function greater(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const strict = Boolean(this.getParam('strict', false));
    const than = Number(this.getParam('than')) || 0;
    const path = this.getParam('path', 'value');
    const key = Array.isArray(path) ? path.shift() : path;
    const value = Number(get(data, key)) || 0;

    if ((!strict && value >= than) || (strict && value > than)) {
        feed.send(data);
    } else {
        feed.end();
    }
}


