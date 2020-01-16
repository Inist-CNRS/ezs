import util from 'util';
import _ from 'lodash';
import Validator from 'validatorjs';

/**
 * From a `Object`, throw the same object if all rules pass
 *
 * Input file:
 *
 * ```json
 * [{
 *    a: 1,
 *    b: 'titi',
 * },
 * {
 *    a: 2,
 *    b: 'toto',
 * },
 * {
 *    a: false,
 * },
 * ]
 * ```
 *
 * Script:
 *
 * ```ini
 * [validate]
 * path = a
 * rule = required|number
 *
 * path = a
 * rule = required|string
 *
 * ```
 *
 * Output:
 *
 * ```json
 * [{
 *    a: 1,
 *    b: 'titi',
 * },
 * {
 *    a: 2,
 *    b: 'toto',
 * },
 * }]
 * ```
 *
 * @name validate
 * @param {String} [path] path of the field
 * @param {String} [rule] rule to validate the field
 * @see laravel validator rules
 * @see https://github.com/skaterdav85/validatorjs#readme
 * @returns {Object}
 */
export default function validate(data, feed) {
    if (this.isLast()) {
        return feed.close();
    }
    const path = this.getParam('path', []);
    const paths = Array.isArray(path) ? path : [path];
    const rule = this.getParam('rule', []);
    const rules = Array.isArray(rule) ? rule : [rule];
    const ruless = _.take(rules, paths.length);
    const pathss = _.take(paths, rules.length);
    const assets = _.zipObject(pathss, ruless);
    const validation = new Validator(data, assets);
    if (validation.fails()) {
        return feed.send(new Error(util.inspect(validation.errors.all())));
    }
    return feed.send(data);
}
