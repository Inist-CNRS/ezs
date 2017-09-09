import path from 'path';

const pluginsList = {};

function resolve(name) {
    try {
        return require.resolve(name);
    } catch (e) {
        return null;
    }
}

function get(ezs, plugin, opts) {
    if (plugin === 'use') {
        // very special case : to load statement in the current pipeline
        const args = !Array.isArray(opts) ? [opts] : opts;
        args.forEach((arg) => {
            if (arg.plugin) {
                let names = arg.plugin(v => v);
                if (!Array.isArray(names)) {
                    names = [names];
                }
                names.forEach((name) => {
                    const plugName1 = 'ezs-'.concat(name.replace(/^ezs-/, ''));
                    const plugName2 = path.resolve(process.cwd(), name);
                    if (resolve(plugName1)) {
                        ezs.use(require(plugName1));
                    } else if (resolve(plugName2)) {
                        ezs.use(require(plugName2));
                    } else {
                        throw new Error(`'${name}' is not loaded. It was not found (try to install it).`);
                    }
                });
            }
        });
        return (data, feed) => feed.send(data);
    } else if (typeof plugin === 'function') {
        return plugin;
    } else if (typeof plugin === 'string') {
        if (pluginsList[plugin]) {
            return pluginsList[plugin];
        }
        const matches = plugin.match(/(\w+)\?(\w+)/);
        if (matches && pluginsList[matches[1]] && ezs[matches[2]]) {
            return ezs[matches[2]](pluginsList[matches[1]]);
        }
    } else if (typeof plugin === 'object') {
        const firstKey = Object.keys(plugin).slice(0, 1);
        if (typeof plugin[firstKey] === 'function') {
            return plugin[firstKey];
        }
    }
    throw new Error(`'${plugin}' is not loaded. It's not a valid statement function.`);
}

function set(ezs, plugin) {
    if (typeof plugin !== 'object') {
        throw new Error('Statement is not loaded. It\'s not a valid plugin (should be an object).');
    }
    const pluginList = plugin.default ? plugin.default : plugin; // ES6 hack
    Object.keys(pluginList).forEach((pluginName) => {
        if (typeof pluginList[pluginName] === 'function') {
            pluginsList[pluginName] = pluginList[pluginName];
        } else if (typeof pluginList[pluginName] === 'object') {
            ezs.use(pluginList[pluginName]);
        } else {
            throw new Error(`${pluginName} is not loaded. It's not a valid plugin.`);
        }
    });
    return ezs;
}

export default {
    get,
    set,
};
