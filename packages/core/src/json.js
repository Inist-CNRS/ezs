import Expression from './expression';

function parse(data) {
    return JSON.parse(data, (key, value) => {
        if (value && typeof value === 'string' && value.indexOf('Expression::') === 0) {
            return new Expression(value.replace('Expression::', ''));
        }
        return value;
    });
}


function stringify(data) {
    return JSON.stringify(data);
}


export default {
    parse,
    stringify,
};
