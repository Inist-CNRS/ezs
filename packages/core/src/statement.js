import path from 'path';
import { DEBUG } from './constants';

const pluginsList = {};

function resolve(name) {
    try {
        return require.resolve(name);
    } catch (e) {
        return null;
    }
}

function all() {
    return Object.keys(pluginsList);
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
                names.forEach((name) => {
                    const before1 = Object.keys(pluginsList);
                    const plugName1 = resolve(
                        'ezs-'.concat(name.replace(/^ezs-/, '')),
                    );
                    const plugName2 = ezs
                        .getPath()
                        .map(dir => path.resolve(dir, name))
                        .map(fil => resolve(fil))
                        .filter(fun => fun !== null)
                        .shift();
                    const plugName3 = resolve(name);
                    if (plugName1) {
                        DEBUG(`Using '${name}' from ${plugName1}`);
                        // eslint-disable-next-line
                        ezs.use(require(plugName1));
                    } else if (plugName2) {
                        DEBUG(`Using '${name}' from ${plugName2}`);
                        // eslint-disable-next-line
                        ezs.use(require(plugName2));
                    } else if (plugName3) {
                        DEBUG(`Using '${name}' from ${plugName1}`);
                        // eslint-disable-next-line
                        ezs.use(require(plugName3));
                    } else {
                        DEBUG(`Unable to find use '${name}' from ${plugName1}`);
                        DEBUG(`Unable to find use '${name}' from ${plugName2}`);
                        DEBUG(`Unable to find use '${name}' from ${plugName3}`);
                        throw new Error(
                            `'${name}' is not loaded. It was not found (try to install it).`,
                        );
                    }
                    const after1 = Object.keys(pluginsList);
                    const diff1 = after1.filter(item => before1.indexOf(item) === -1);
                    if (diff1.length > 0) {
                        DEBUG(`These statements are registered: ${diff1.join(',')}`);
                    }
                });
            }
        });
        return (data, feed) => feed.send(data);
    } if (typeof plugin === 'function') {
        return plugin;
    } if (typeof plugin === 'string' && pluginsList[plugin]) {
        return pluginsList[plugin];
    } if (typeof plugin === 'object') {
        const firstKey = Object.keys(plugin).slice(0, 1);
        if (typeof plugin[firstKey] === 'function') {
            return plugin[firstKey];
        }
    }
    throw new Error(
        `'${plugin}' is not loaded. It's not a valid statement function.`,
    );
}

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

function exists(ezs, pluginName) {
    return pluginsList[pluginName] !== undefined;
}


export default {
    get,
    set,
    all,
    exists,
};
