import { get, mergeWith } from 'lodash';
import core from './core';


function customizer(objValue, srcValue) {
    if (Array.isArray(objValue)) {
        return objValue.concat(srcValue).filter((x) => x != null);
    }
    if (objValue) {
        return [].concat([objValue, srcValue]);
    }
    return objValue;
}

/**
 * Take special `Object` like `{id, value}` and replace `value` with the merge of `value`s
 *
 * ```json
 * [{
 * }]
 * ```
 *
 * Script:
 *
 * ```ini
 * [use]
 * plugin = analytics
 *
 * [merging]
 *
 * ```
 *
 * Output:
 *
 * ```json
 * [
 * ]
 * ```
 *
 * @name merging
 * @param {String} [id=id] path to use for id
 * @param {String} [value=value] path to use for value
 * @returns {Object}
 */
export default function merging(data, feed) {
    if (this.isLast()) {
        feed.close();
        return;
    }
    const id = get(data, this.getParam('id', 'id')) || this.getIndex();
    const value = get(data, this.getParam('value', 'value'));
    const values = Array.isArray(value) ? value : [value];
    if (id && value) {
        const vls = values
            .filter((k) => typeof k === 'object')
            .reduce((prev, cur) => mergeWith(prev, cur, customizer), {});
        Object.keys(vls).forEach((key) => vls[key] === undefined && delete vls[key]);
        feed.write(core(id, vls));
    }
    feed.end();
}
