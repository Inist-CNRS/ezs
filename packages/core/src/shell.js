import autocast from 'autocast';
import _ from 'lodash';
import safeEval from 'notevil';
import mixins from './mixins';

const parse = context => (value) => {
    const js = [];
    js.push('_.chain(self).');
    js.push(value.replace(/([)]\s*->\s*)/g, ').'));
    js.push('.value();');
    const code = js.join('');
    const data = typeof context === 'object' ? _.omitBy(context, _.isFunction) : context;
    _.mixin(mixins);
    const result = safeEval(code, {
        _,
        self: data,
    });
    return result;
};


const analyse = context => (value) => {
    if (Array.isArray(value)) {
        return value.map(analyse(context));
    }
    if (!value || typeof value !== 'string') {
        return value;
    }
    if (value.match(/^[a-zA-Z][a-zA-Z0-9]*[(]/)) {
        return parse(context)(value);
    }
    return autocast(value);
};

export default function Shell(value, context) {
    if (Array.isArray(value)) {
        return value.map((item) => {
            if (typeof value !== 'function') {
                return item;
            }
            return item(analyse(context));
        });
    }
    if (!value.through) {
        return value;
    }
    return value.through(analyse(context));
}
