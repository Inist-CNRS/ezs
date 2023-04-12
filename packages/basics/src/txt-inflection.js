import get from 'lodash.get';
import { transform } from 'inflection';


const transformer = (transformations) =>
    (str) =>
        (str && typeof str === 'string') ? transform( str, transformations) : str;

const TXTInflection = (data, feed, ctx) => {
    if (ctx.isLast()) {
        return feed.close();
    }
    const transformations = [].concat(ctx.getParam('transform', [])).filter(Boolean);
    const path = ctx.getParam('path', 'value');
    const value = get(data, path, '');
    const process = transformer(transformations);
    const  result = Array.isArray(value) ? value.map((item) => process(item)) : process(value);

    feed.write({ ...data, [path]: result });
    return feed.end();
};

/**
 * Take a `String` and inflect it with or more transformers from this list
 *  pluralize, singularize, camelize, underscore, humanize, capitalize,
 *  dasherize, titleize, demodulize, tableize, classify, foreign_key, ordinalize
 *
 * Input:
 *
 * ```json
 * { "id": 1, "value": "all job" }
 * ```
 * Script:
 * ```ini
 * [TXTInflection]
 * transform = pluralize
 * transform = capitalize
 * transform = dasherize
 * ```
 *
 * Output:
 *
 * ```json
 * { "id": 1, "value": "All-jobs" }
 * ```
 *
 * @name TXTInflection
 * @param {String} [path="value"] path of the field to segment
 * @param {String} [transform] name of a transformer
 * @returns {String[]}
 * @see https://www.npmjs.com/package/inflection
 */
export default {
    TXTInflection,
};
