import { access, constants, writeFile, unlink } from 'fs/promises';
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

export const checkFusible = async (fusible) => {
    if (!fusible) {
        return false;
    }
    const fusibleFile = resolve(normalize(location), fusible + extension);
    try {
        await access(fusibleFile, constants.R_OK);
        return true;
    } catch {
        return false;
    }
};


export const enableFusible = async (fusible) => {
    const fusibleFile = resolve(normalize(location), fusible + extension);
    const check = await checkFusible(fusible);
    if (!check) {
        const fileContent = checksum(fusible);
        await writeFile(fusibleFile, fileContent);
    }
    return true;
};

export const disableFusible = async (fusible) => {
    const fusibleFile = resolve(normalize(location), fusible + extension);
    const check = await checkFusible(fusible);
    if (check) {
        await unlink(fusibleFile);
    }
    return true;
};

