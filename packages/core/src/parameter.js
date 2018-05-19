import Statement from './statement';

const parametersList = {};

function pack() {
    const buf = new Buffer(JSON.stringify(parametersList));
    return buf.toString('base64');
}

function unpack(data) {
    const buf = new Buffer(data, 'base64');
    const txt = buf.toString('ascii');
    return JSON.parse(txt);
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
};
