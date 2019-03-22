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
export function useFile(ezs, name) {
    const plugName1 = check(
        'ezs-'.concat(name.replace(/^ezs-/, '')),
    );
    const plugName2 = ezs
        .getPath()
        .map(dir => resolve(dir, name))
        .map(fil => check(fil))
        .filter(fun => fun !== null)
        .shift();
    const plugName3 = check(name);
    if (plugName1) {
        debug('ezs')(`Using '${name}' from ${plugName1}`);
        return plugName1;
    }
    if (plugName2) {
        debug('ezs')(`Using '${name}' from ${plugName2}`);
        return plugName2;
    }
    if (plugName3) {
        debug('ezs')(`Using '${name}' from ${plugName1}`);
        return plugName3;
    }
    debug('ezs')(`Unable to find '${name}' from ${plugName1}`);
    debug('ezs')(`Unable to find '${name}' from ${plugName2}`);
    debug('ezs')(`Unable to find '${name}' from ${plugName3}`);
    return false;
}

export function isFile(file) {
    try {
        return statSync(file).isFile();
    } catch (e) {
        return false;
    }
}

export default function File(ezs, name) {
    try {
        const filename = useFile(ezs, name);
        if (!filename) {
            return false;
        }
        if (!isFile(filename)) {
            return false;
        }
        ezs.addPath(dirname(filename));
        return readFileSync(filename, 'utf8');
    } catch (e) {
        return false;
    }
}
