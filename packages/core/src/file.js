import { readFileSync, statSync } from 'fs';
import { dirname, resolve } from 'path';
import debug from 'debug';


function check(name) {
    try {
        return require.resolve(name);
    } catch (e) {
        return null;
    }
}
function findFileIn(paths, name) {
    return paths
        .map((dir) => resolve(dir, name))
        .map((fil) => check(fil))
        .filter(Boolean)
        .shift();
}
export function useFile(ezs, name) {
    const names = [
        name,
        '@ezs/'.concat(name.replace(/^@ezs\//, '')),
        'ezs-'.concat(name.replace(/^ezs-/, '')),
    ];
    const plugName1 = names.map((n) => check(n)).filter(Boolean).shift();
    const plugName2 = names.map((n) => findFileIn(ezs.getPath(), n)).filter(Boolean).shift();
    if (plugName1) {
        debug('ezs')(`Using '${name}' from ${plugName1}`);
        return plugName1;
    }
    if (plugName2) {
        debug('ezs')(`Using '${name}' from ${plugName2}`);
        return plugName2;
    }
    debug('ezs')(`Unable to find '${name}' from ${plugName1}`);
    debug('ezs')(`Unable to find '${name}' from ${plugName2}`);
    return false;
}

export function isFile(file) {
    try {
        return statSync(file).isFile();
    } catch (e) {
        debug('ezs')(`Unable to check '${file}'`);
        return false;
    }
}

export default function File(ezs, name) {
    try {
        const filename = [findFileIn(ezs.getPath(), name), check(name)].filter(Boolean).shift();
        if (!filename) {
            debug('ezs')(`Unable to find '${name}' from ${filename}`);
            return false;
        }
        ezs.addPath(dirname(filename));
        return readFileSync(filename, 'utf8');
    } catch (e) {
        return false;
    }
}
