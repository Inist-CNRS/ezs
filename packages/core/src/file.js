import { readFileSync, statSync } from 'fs';
import { dirname, resolve } from 'path';
import { DEBUG } from './constants';


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
        DEBUG(`Using '${name}' from ${plugName1}`);
        return plugName1;
    }
    if (plugName2) {
        DEBUG(`Using '${name}' from ${plugName2}`);
        return plugName2;
    }
    if (plugName3) {
        DEBUG(`Using '${name}' from ${plugName1}`);
        return plugName3;
    }
    DEBUG(`Unable to find '${name}' from ${plugName1}`);
    DEBUG(`Unable to find '${name}' from ${plugName2}`);
    DEBUG(`Unable to find '${name}' from ${plugName3}`);
    return false;
}



export default function File(ezs, name) {
    try {
        const filename = useFile(ezs, name);
        if (!filename) {
            return false;
        }
        if (!statSync(filename).isFile()) {
            return false;
        }
        ezs.addPath(dirname(filename));
        return readFileSync(filename, 'utf8');
    } catch (e) {
        return false;
    }
}
