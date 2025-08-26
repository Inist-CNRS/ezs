import fs from 'fs';
import path from 'path';
import filenameRegex from 'filename-regex';
import filedirname from 'filedirname';

const [, dirname] = filedirname();
const pckg = JSON.parse(fs.readFileSync(path.resolve(dirname, '../package.json')));

export const VERBOSE = 'ezs:*,-ezs:debug,-ezs:trace';
export const VERSION = pckg.version;
export const STARTED_AT = Date.now();
export const RX_FILENAME = filenameRegex();
