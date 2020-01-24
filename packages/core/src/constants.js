import filenameRegex from 'filename-regex';
import { version } from '../package.json';

export const M_NORMAL = 'normal';
export const M_SINGLE = 'unique';
export const M_DISPATCH = 'detachable';
export const M_ALL = [M_DISPATCH, M_NORMAL, M_SINGLE, 'single'];
export const VERSION = version;
export const STARTED_AT = Date.now();
export const RX_IDENTIFIER = new RegExp(/^[a-z]+:\//);
export const RX_FILENAME = filenameRegex();
