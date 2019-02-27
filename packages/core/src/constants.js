import debug from 'debug';
import { version } from '../package.json';

export const M_NORMAL = 'normal';
export const M_SINGLE = 'unique';
export const M_DISPATCH = 'detachable';
export const DEBUG = debug('ezs');
export const VERSION = version;
export const STARTED_AT = Date.now();
