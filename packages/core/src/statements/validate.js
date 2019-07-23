import util from 'util';
import _ from 'lodash';
import Validator from 'validatorjs';

/**
 * Take `Object` and throw the same object if all rules passes
 *
 * @param {String} [path] path of the field
 * @param {String} [rule] rule to validate the field
 * @see laravel validtor rules
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
