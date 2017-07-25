import autocast from 'autocast';
import lodash from 'lodash';
import safeEval from 'safe-eval';
import mixins from './mixins';

const parse = context => (value) => {
    const js = [];
    js.push('lodash.chain(data).');
    js.push(value.replace(/([)]\s*->\s*)/g, ').'));
    js.push('.value();');
    const code = js.join('');
    lodash.mixin(mixins);
    const result = safeEval(code, {
        lodash,
        data: context,
    });
    return result;
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
