import vm from 'vm';
import autocast from 'autocast';
import _ from 'lodash';
import mixins from './mixins';

const generateCode = (expressionValue) => {
    const js = [];
    js.push('_.chain(self).');
    js.push(expressionValue.replace(/([)]\s*->\s*)/g, ').'));
    js.push('.value();');
    const code = js.join('');
    const script = new vm.Script(code);
    return script;
};

export default class Shell {
    constructor(ezs, environment) {
        this.ezs = ezs;
        this.environment = environment;
        const lodash = _.runInContext();
        lodash.mixin({
            ...mixins,
            env: (i, p, d) => (p ? _.get(this.environment, p, d) : this.environment),
        });
        this.contextObject = {
            _: lodash,
            self: {},
        };
        this.context = vm.createContext(this.contextObject);
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
        const { ezs } = this;
        const via = (expressionValue) => {
            if (Array.isArray(expressionValue)) {
                return expressionValue.map(this.analyse(chunk));
            }
            if (!expressionValue || typeof expressionValue !== 'string') {
                return expressionValue;
            }
            if (expressionValue.match(/^[a-zA-Z][a-zA-Z0-9]*[(]/)) {
                const code = ezs.memoize(expressionValue, () => generateCode(expressionValue));
                this.contextObject.self = chunk;
                return code.runInContext(this.context);
            }
            return autocast(expressionValue);
        };
        return via;
    }
}
