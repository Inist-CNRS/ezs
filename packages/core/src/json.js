import Expression from './expression.js';

function parse(data) {
    if (!data) return data;
    return JSON.parse(data, (key, value) => {
        if (value && typeof value === 'string' && value.indexOf('Expression::') === 0) {
            return new Expression(JSON.parse(value.replace('Expression::', '')));
        }
        return value;
    });
}

function stringify(data) {
    if (!data) return data;
    return JSON.stringify(data);
}

export default {
    parse,
    stringify,
};
