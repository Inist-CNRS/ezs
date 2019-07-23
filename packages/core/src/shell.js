import autocast from 'autocast';
import _ from 'lodash';
import safeEval from 'notevil';
import mixins from './mixins';

const parse = (chunk, environment) => (expression) => {
    const js = [];
    js.push('_.chain(self).');
    js.push(expression.replace(/([)]\s*->\s*)/g, ').'));
    js.push('.value();');
    const code = js.join('');
    const data = typeof chunk === 'object' ? _.omitBy(chunk, _.isFunction) : chunk;
    _.mixin({
        ...mixins,
        env: (i, p, d) => (p ? _.get(environment, p, d) : environment),
    });
    const result = safeEval(code, {
        _,
        self: data,
    });
    return result;
};


const analyse = (chunk, environment) => (expression) => {
    if (Array.isArray(expression)) {
        return expression.map(analyse(chunk, environment));
    }
    if (!expression || typeof expression !== 'string') {
        return expression;
    }
    if (expression.match(/^[a-zA-Z][a-zA-Z0-9]*[(]/)) {
        return parse(chunk, environment)(expression);
    }
    return autocast(expression);
};

export default function Shell(expression, chunk, environment) {
    if (Array.isArray(expression)) {
        return expression.map((item) => {
            if (typeof expression !== 'function') {
                return item;
            }
            return item(analyse(chunk, environment));
        });
    }
    if (!expression || !expression.through) {
        return expression;
    }
    return expression.through(analyse(chunk, environment));
}
