import Statement from './statement';
import JSONezs from './json';

const parametersList = {};

function encode(string) {
    return Buffer.from(string).toString('base64');
}

function decode(string) {
    return Buffer.from(string, 'base64').toString();
}

function pack() {
    return encode(JSON.stringify(parametersList));
}

function unpack(data) {
    return JSON.parse(decode(data));
}

function unscramble(data) {
    return JSONezs.parse(decode(data));
}

function get(ezs, pluginName) {
    return parametersList[pluginName] ? parametersList[pluginName] : {};
}

function set(ezs, pluginName, opts) {
    if (!Statement.exists(ezs, pluginName)) {
        throw new Error('Statement does not exists. Register it, before trying to configure it.');
    }
    if (typeof opts !== 'object') {
        throw new Error('Statement parameter must be an object.');
    }
    parametersList[pluginName] = opts;
}

function put(ezs, parameters) {
    Object.keys(parameters).forEach(key => set(ezs, key, parameters[key]));
}

export default {
    get,
    set,
    put,
    pack,
    unpack,
    encode,
    decode,
    unscramble,
};
