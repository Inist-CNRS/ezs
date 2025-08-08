import debug from 'debug';
import { useFile } from './file.js';
import transit from './statements/transit.js';

const pluginsModules = {};
const pluginsList = {};

function set(ezs, plugin) {
    if (typeof plugin !== 'object') {
        throw new Error(
            "Statement is not loaded. It's not a valid plugin (should be an object).",
        );
    }
    const pluginList = plugin.default ? plugin.default : plugin; // ES6 hack
    Object.keys(pluginList).forEach((pluginName) => {
        if (typeof pluginList[pluginName] === 'function') {
            pluginsList[pluginName] = pluginList[pluginName];
        } else if (typeof pluginList[pluginName] === 'object') {
            ezs.use(pluginList[pluginName]);
        } else {
            throw new Error(
                `${pluginName} is not loaded. It's not a valid plugin.`,
            );
        }
    });
    return ezs;
}

function load(ezs, name) {
    const before1 = Object.keys(pluginsList);
    const fileName = useFile(ezs, name);
    if (!fileName) {
        throw new Error(
            `'${name}' is not loaded. It was not found (try to install it).`,
        );
    }
    if (!pluginsModules[fileName]) {
        pluginsModules[fileName] = import(fileName);
        pluginsModules[fileName].then((funcs) => {
            set(ezs, funcs);
            const after1 = Object.keys(pluginsList);
            const diff1 = after1.filter((item) => before1.indexOf(item) === -1);
            if (diff1.length > 0) {
                debug('ezs:debug')(`These statements are registered: ${diff1.join(',')}`);
            }
        });
    }
}

function get(ezs, plugin, opts) {
    if (plugin === 'use') {
        // very special case : to load statement in the current pipeline
        const args = !Array.isArray(opts) ? [opts] : opts;
        args.forEach((arg) => {
            if (arg.plugin) {
                let names = arg.plugin.get();
                if (!Array.isArray(names)) {
                    names = [names];
                }
                names.forEach((name) => load(ezs, name));
            }
        });
        return Promise.resolve(transit);
    }
    if (typeof plugin === 'function') {
        return Promise.resolve(plugin);
    }

    return Promise.all(Object.values(pluginsModules))
        .then(() => {
            if (typeof plugin === 'string' && pluginsList[plugin]) {
                return Promise.resolve(pluginsList[plugin]);
            }
            if (typeof plugin === 'string' && plugin.indexOf(':') !== -1) {
                const [use, name] = plugin.split(':');
                load(ezs, use);
                return get(ezs, name, opts);
            }
            if (typeof plugin === 'object') {
                const keys = Object.keys(plugin);
                const firstKey = keys.length ? keys[0] : '';
                if (typeof plugin[firstKey] === 'function') {
                    return Promise.resolve(plugin[firstKey]);
                }
            }
            return Promise.resolve(plugin);
        });
}



function exists(ezs, pluginName) {
    return pluginsList[pluginName] !== undefined;
}

export default {
    get,
    set,
    load,
    exists,
};
