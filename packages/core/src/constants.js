import filenameRegex from 'filename-regex';

export const VERBOSE = 'ezs:*,-ezs:debug,-ezs:trace';
export const VERSION = '6';
export const STARTED_AT = Date.now();
export const RX_FILENAME = filenameRegex();
