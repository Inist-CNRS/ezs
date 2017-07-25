import assert from 'assert';
import Engine from './engine';
import Pipeline from './pipeline';
import Script from './script';
import Tag from './tag';
import Plugins from './plugins';


const isStatement = name => typeof name === 'function';
const isPlugin = (ezs, name) => typeof name === 'string' && ezs.plugins[name];

const ezs = (name, opts) => {
    if (isStatement(name)) {
        return new Engine(name, opts);
    }
    if (isPlugin(ezs, name)) {
        return new Engine(ezs.plugins[name], opts);
    }
    throw new Error(`'${name}' is not loaded. It's not a valid function or plugin function.`);
};

ezs.plugins = Plugins;

ezs.use = (module) => {
    assert.equal(typeof module, 'object');
    Object.keys(module).forEach((moduleName) => {
        if (isStatement(module[moduleName])) {
            ezs.plugins[moduleName] = module[moduleName];
        } else {
            throw new Error(`${moduleName} is not loaded. It's not a valid plugin function.`);
        }
    });
    return ezs;
};


ezs.pipeline = (commands, options) => new Pipeline(ezs, commands, options);
ezs.script = (commands, options) => new Pipeline(ezs, Script(commands), options);
ezs.tag = (tagname, func) => new Tag(tagname, func);

ezs.has = (tagname, name, opts) => {
    if (isStatement(name)) {
        return new Engine(name, opts, tagname);
    }
    if (isPlugin(ezs, name)) {
        return new Engine(ezs.plugins[name], opts, tagname);
    }
    throw new Error(`${name} is  unknown`);
};

module.exports = ezs;

