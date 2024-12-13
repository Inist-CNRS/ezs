import { access, constants, writeFile, unlink } from 'fs';
import { resolve, normalize } from 'path';
import { tmpdir } from 'os';
import generate from 'nanoid/async/generate';
import nolookalikes from 'nanoid-dictionary/nolookalikes';

import { checksum } from './statements/identify';

const location = tmpdir();
const extension = '.sid';

export const createFusible = async () => {
    const fusible = await generate(nolookalikes, 16);
    return fusible;
};

export const checkFusible = (fusible) => new Promise((next) => {
    if (!fusible) {
        return next(false);
    }
    const fusibleFile = resolve(normalize(location), fusible + extension);
    return access(fusibleFile, constants.R_OK, (err) => {
        if (err) {
            return next(false);
        }
        return next(true);
    });
});


export const enableFusible = (fusible) => new Promise((next, cancel) => {
    const fusibleFile = resolve(normalize(location), fusible + extension);
    checkFusible(fusible).then((check) => {
        if (!check) {
            const fileContent = checksum(fusible);
            writeFile(fusibleFile, fileContent, (err) => {
                if (err) {
                    return cancel(err);
                }
                return next(true);
            });
        }
        return next(true);
    });
});

export const disableFusible = (fusible) => new Promise((next, cancel) => {
    const fusibleFile = resolve(normalize(location), fusible + extension);
    checkFusible(fusible).then((check) => {
        if (check) {
            unlink(fusibleFile, (err) => {
                if (err) {
                    return cancel(err);
                }
                return next(true);
            });
        }
        return next(true);
    });
    return true;
});

