import vm from 'vm';
import autocast from 'autocast';
import _ from 'lodash';
import mixins from './mixins';

const safeEval = (code, sandbox) => {
    const script = new vm.Script(code);
    const context = vm.createContext(sandbox);
    return script.runInContext(context);
};

const generateCode = (expressionValue) => {
    const js = [];
    js.push('_.chain(self).');
    js.push(expressionValue.replace(/([)]\s*->\s*)/g, ').'));
    js.push('.value();');
    const code = js.join('');
    const script = new vm.Script(code);
    return script;
};


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

export default class Shell {
    constructor(ezs, environment) {
        this.environment = environment;
        this.lodash = _.runInContext();
        this.lodash.mixin({
            ...mixins,
            env: (i, p, d) => (p ? _.get(this.environment, p, d) : this.environment),
        });
    }

    run(expression, chunk) {
        if (Array.isArray(expression)) {
            return expression.map((item) => {
                if (typeof expression !== 'function') {
                    return item;
                }
                return item(this.analyse(chunk));
            });
        }
        if (!expression || !expression.through) {
            return expression;
        }
        return expression.through(this.analyse(chunk));
    }

    analyse(chunk) {
        const via = (expressionValue) => {
            if (Array.isArray(expressionValue)) {
                return expressionValue.map(this.analyse(chunk));
            }
            if (!expressionValue || typeof expressionValue !== 'string') {
                return expressionValue;
            }
            if (expressionValue.match(/^[a-zA-Z][a-zA-Z0-9]*[(]/)) {
                const code = generateCode(expressionValue);
                const context = vm.createContext({
                    _: this.lodash,
                    self: chunk,
                });
                return code.runInContext(context);
            }
            return autocast(expressionValue);
        };
        return via;
    }
}
