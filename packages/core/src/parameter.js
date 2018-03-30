import Statement from './statement';

const parametersList = {};

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

export default {
    get,
    set,
};
