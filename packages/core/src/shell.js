import autocast from 'autocast';
import _ from 'lodash';
import safeEval from 'safe-eval';
import mixins from './mixins';

const parse = context => (value) => {
    const js = [];
    js.push('_.chain(data).');
    js.push(value.replace(/([)]\s*->\s*)/g, ').'));
    js.push('.value();');
    const code = js.join('');
    const data = typeof context === 'object' ? _.omitBy(context, _.isFunction) : context;
    _.mixin(mixins);
    const result = safeEval(code, {
        _,
        data,
    });
    return Array.isArray(result) ? [result] : result;
};


const analyse = context => (value) => {
    if (Array.isArray(value)) {
        return value.map(analyse(context));
    }
    if (!value) {
        return value;
    }
    if (value.match(/^[a-zA-Z][a-zA-Z0-9]*[(]/)) {
        return parse(context)(value);
    }
    return autocast(value);
};

export default function Shell(value, context) {
    if (typeof value !== 'function') {
        return value;
    }
    return value(analyse(context));
}
