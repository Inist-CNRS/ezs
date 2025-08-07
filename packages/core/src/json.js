import Expression from './expression.js';

function parse(data) {
    if (data) {
        return JSON.parse(data, (key, value) => {
            if (value && typeof value === 'string' && value.indexOf('Expression::') === 0) {
                return new Expression(JSON.parse(value.replace('Expression::', '')));
            }
            return value;
        });
    }
    return data;
}

function stringify(data) {
    if (data) {
        return JSON.stringify(data);
    }
    return data;
}

export default {
    parse,
    stringify,
};
