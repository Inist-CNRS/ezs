import { readFileSync, statSync } from 'fs';
import { basename, dirname, resolve } from 'path';
import debug from 'debug';
import module from 'module';
import filedirname from 'filedirname';

const [currentFilename] = filedirname();

const req = module.createRequire(currentFilename);

function check(name) {
    try {
        return req.resolve(name);
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
    const bname = basename(name);
    const names = [
        name,
        bname,
        '@ezs/'.concat(String(name).replace(/^@ezs\//, '')),
        'ezs-'.concat(String(name).replace(/^ezs-/, '')),
        '@ezs/'.concat(String(bname).replace(/^@ezs\//, '')),
        'ezs-'.concat(String(bname).replace(/^ezs-/, '')),
        String(bname).concat('/src/'),
    ];
    const plugName1 = names.map((n) => check(n)).filter(Boolean).shift();
    const plugName2 = names.map((n) => findFileIn(ezs.getPath(), n)).filter(Boolean).shift();
    if (plugName1) {
        return plugName1;
    }
    if (plugName2) {
        return plugName2;
    }
    debug('ezs:warn')(`Unable to find '${name}' in paths ${JSON.stringify(ezs.getPath())}`);
    return false;
}

export function isFile(file) {
    try {
        return statSync(file).isFile();
    } catch (e) {
        debug('ezs:warn')(`Unable to check '${file}'`);
        return false;
    }
}

export default function File(ezs, name) {
    try {
        const filename = [findFileIn(ezs.getPath(), name), check(name)].filter(Boolean).shift();
        if (!filename) {
            debug('ezs:warn')(`Unable to find '${name}' from ${ezs.getPath()}`);
            return false;
        }
        ezs.addPath(dirname(filename));
        return readFileSync(filename, 'utf8');
    } catch (e) {
        return false;
    }
}
