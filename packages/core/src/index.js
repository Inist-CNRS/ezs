import assert from 'assert';
import Engine from './engine';
import Pipeline from './pipeline';
import Script from './script';
import Tag from './tag';
import Output from './output';
import Plugins from './plugins';

const getStatement = (ezs, input) => {
    if (typeof input === 'function') {
        return input;
    } else if (typeof input === 'string' && ezs.plugins[input]) {
        return ezs.plugins[input];
    } else if (typeof input === 'object') {
        const firstKey = Object.keys(input).slice(0, 1);
        if (typeof input[firstKey] === 'function') {
            return input[firstKey];
        }
    }
    throw new Error(`'${input}' is not loaded. It's not a valid statement function.`);
};

const ezs = (name, opts) => new Engine(getStatement(ezs, name), opts);

ezs.pipeline = (commands, options) => new Pipeline(ezs, commands, options);
ezs.script = (commands, options) => new Pipeline(ezs, Script(commands), options);
ezs.tag = (tagname, func) => new Tag(tagname, func);
ezs.has = (tagname, name, opts) => new Engine(getStatement(ezs, name), opts, tagname);
ezs.toBuffer = opts => new Output(opts);

ezs.plugins = Plugins;

ezs.use = (plugin) => {
    assert.equal(typeof plugin, 'object');
    const pluginList = plugin.default ? plugin.default : plugin; // ES6 hack
    Object.keys(pluginList).forEach((pluginName) => {
        if (typeof pluginList[pluginName] === 'function') {
            ezs.plugins[pluginName] = pluginList[pluginName];
        } else if (typeof pluginList[pluginName] === 'object') {
            ezs.use(pluginList[pluginName]);
        } else {
            throw new Error(`${pluginName} is not loaded. It's not a valid plugin.`);
        }
    });
    return ezs;
};

module.exports = ezs;

