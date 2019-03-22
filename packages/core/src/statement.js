import debug from 'debug';
import { useFile } from './file';

const pluginsList = {};

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
                    const fileName = useFile(ezs, name);
                    if (!fileName) {
                        throw new Error(
                            `'${name}' is not loaded. It was not found (try to install it).`,
                        );
                    }
                    // eslint-disable-next-line
                    ezs.use(require(fileName));
                    const after1 = Object.keys(pluginsList);
                    const diff1 = after1.filter(item => before1.indexOf(item) === -1);
                    if (diff1.length > 0) {
                        debug('ezs')(`These statements are registered: ${diff1.join(',')}`);
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
