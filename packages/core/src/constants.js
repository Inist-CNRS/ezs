import filenameRegex from 'filename-regex';
import { version } from '../package.json';

export const VERBOSE = 'ezs:*,-ezs:debug,-ezs:trace';
export const VERSION = version;
export const STARTED_AT = Date.now();
export const RX_FILENAME = filenameRegex();
