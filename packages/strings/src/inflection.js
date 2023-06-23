import get from 'lodash.get';
import { transform } from 'inflection';

const transformer = (transformations) => (str) =>
    str && typeof str === 'string' ? transform(str, transformations) : str;

const inflection = (data, feed, ctx) => {
    if (ctx.isLast()) {
        return feed.close();
    }
    const transformations = []
        .concat(ctx.getParam('transform', []))
        .filter(Boolean);
    const path = ctx.getParam('path', '');
    const string = path ? get(data, path, '') : data;
    const process = transformer(transformations);
    const result = Array.isArray(string)
        ? string.map((item) => process(item))
        : process(string);

    feed.write(path ? { ...data, [path]: result } : result);
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
 *
 * Script:
 *
 * ```ini
 * [inflection]
 * path = value
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
 * > 📗 When the path is not given, the input data is considered as a string,
 * > allowing to apply `inflection` on a string stream.
 *
 * see https://www.npmjs.com/package/inflection
 *
 * @name inflection
 * @param {string} [path=""] path of the field to segment
 * @param {string} [transform] name of a transformer
 * @returns {string[]}
 */
export default {
    inflection,
};
