import filenameRegex from 'filename-regex';
import pckg from '../package.json' with { type: 'json' };

export const VERBOSE = 'ezs:*,-ezs:debug,-ezs:trace';
export const VERSION = pckg.version;
export const STARTED_AT = Date.now();
export const RX_FILENAME = filenameRegex();
